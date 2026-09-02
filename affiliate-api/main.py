#!/usr/bin/env python3
"""
Affiliate API Service - Sistema de comisiones para New-API
Compatible con PostgreSQL
"""
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt

# Config
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
COMMISSION_RATE = Decimal(os.getenv("COMMISSION_RATE", "0.30"))
PORT = int(os.getenv("PORT", "8080"))

app = FastAPI(title="Affiliate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
from pathlib import Path

STATIC_DIR = Path(__file__).parent

@app.get("/dashboard.html")
async def serve_dashboard():
    return FileResponse(STATIC_DIR / "dashboard.html")

@app.get("/admin.html")
async def serve_admin():
    return FileResponse(STATIC_DIR / "admin.html")

@app.get("/affiliates")
async def serve_affiliates():
    return FileResponse(STATIC_DIR / "affiliates.html")

@app.get("/")
async def root():
    return FileResponse(STATIC_DIR / "affiliates.html")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["user_id"]
    except:
        raise HTTPException(401, "Invalid token")

async def get_current_user(authorization: str = Header(None), conn=Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ")[1]
    user_id = verify_token(token)
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(404, "User not found")
        return user

# Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AffiliateUpdateRequest(BaseModel):
    wallet_address: Optional[str] = None

class MarkPaidRequest(BaseModel):
    commission_ids: list[int]

# Endpoints
@app.post("/api/affiliate/login")
async def login(req: LoginRequest, conn=Depends(get_db)):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, password FROM users WHERE email = %s AND status = 1",
            (req.email,)
        )
        user = cur.fetchone()
        if not user or user["password"] != hash_password(req.password):
            raise HTTPException(401, "Invalid credentials")

        token = create_token(user["id"])
        return {"token": token}

@app.get("/api/affiliate/dashboard")
async def get_dashboard(user=Depends(get_current_user), conn=Depends(get_db)):
    user_id = user["id"]

    with conn.cursor() as cur:
        # Stats
        cur.execute("""
            SELECT
                aff_code, aff_count, aff_quota, aff_history_quota,
                (SELECT COUNT(*) FROM users WHERE inviter_id = %s) as total_referrals,
                (SELECT COALESCE(SUM(amount), 0) FROM commissions
                 WHERE inviter_id = %s AND status = 'pending') as pending_commissions,
                (SELECT COALESCE(SUM(amount), 0) FROM commissions
                 WHERE inviter_id = %s AND status = 'paid') as paid_commissions
            FROM users WHERE id = %s
        """, (user_id, user_id, user_id, user_id))
        stats = cur.fetchone()

        # Recent commissions
        cur.execute("""
            SELECT c.*, u.username, u.email
            FROM commissions c
            JOIN users u ON c.user_id = u.id
            WHERE c.inviter_id = %s
            ORDER BY c.created_at DESC
            LIMIT 50
        """, (user_id,))
        commissions = cur.fetchall()

        # Affiliate metadata
        cur.execute(
            "SELECT * FROM affiliates WHERE user_id = %s",
            (user_id,)
        )
        affiliate = cur.fetchone()

        return {
            "aff_code": stats["aff_code"],
            "aff_link": f"https://resuelve-api.lat?ref={stats['aff_code']}",
            "total_referrals": stats["aff_count"],
            "pending_quota": stats["aff_quota"],
            "total_earned": stats["aff_history_quota"],
            "pending_commissions": stats["pending_commissions"],
            "paid_commissions": stats["paid_commissions"],
            "wallet_address": affiliate["wallet_address"] if affiliate else None,
            "last_payout": affiliate["last_payout_at"] if affiliate else None,
            "commissions": commissions
        }

@app.put("/api/affiliate/profile")
async def update_profile(
    req: AffiliateUpdateRequest,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    user_id = user["id"]
    now = int(datetime.now().timestamp())

    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM affiliates WHERE user_id = %s",
            (user_id,)
        )
        exists = cur.fetchone()

        if exists:
            cur.execute("""
                UPDATE affiliates
                SET wallet_address = %s, updated_at = %s
                WHERE user_id = %s
            """, (req.wallet_address, now, user_id))
        else:
            cur.execute("""
                INSERT INTO affiliates (user_id, wallet_address, created_at, updated_at)
                VALUES (%s, %s, %s, %s)
            """, (user_id, req.wallet_address, now, now))

        conn.commit()
        return {"message": "Profile updated"}

# Admin endpoints (require admin check)
@app.get("/api/admin/affiliates")
async def get_all_affiliates(user=Depends(get_current_user), conn=Depends(get_db)):
    if user["role"] != 100:  # Admin role
        raise HTTPException(403, "Admin only")

    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.username, u.email, u.aff_code, u.aff_count,
                   u.aff_quota, u.aff_history_quota,
                   a.wallet_address, a.total_paid, a.last_payout_at,
                   COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0) as pending,
                   COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0) as paid
            FROM users u
            LEFT JOIN affiliates a ON u.id = a.user_id
            LEFT JOIN commissions c ON u.id = c.inviter_id
            WHERE u.aff_count > 0
            GROUP BY u.id, a.wallet_address, a.total_paid, a.last_payout_at
            ORDER BY u.aff_count DESC
        """)
        return {"affiliates": cur.fetchall()}

@app.get("/api/admin/commissions/pending")
async def get_pending_commissions(user=Depends(get_current_user), conn=Depends(get_db)):
    if user["role"] != 100:
        raise HTTPException(403, "Admin only")

    with conn.cursor() as cur:
        cur.execute("""
            SELECT c.*, u.username as inviter_name, u.email as inviter_email,
                   a.wallet_address
            FROM commissions c
            JOIN users u ON c.inviter_id = u.id
            LEFT JOIN affiliates a ON u.id = a.user_id
            WHERE c.status = 'pending'
            ORDER BY c.created_at DESC
        """)
        return {"commissions": cur.fetchall()}

@app.post("/api/admin/commissions/mark-paid")
async def mark_commissions_paid(
    req: MarkPaidRequest,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    if user["role"] != 100:
        raise HTTPException(403, "Admin only")

    now = int(datetime.now().timestamp())

    with conn.cursor() as cur:
        # Mark as paid
        cur.execute("""
            UPDATE commissions
            SET status = 'paid', paid_at = %s
            WHERE id = ANY(%s) AND status = 'pending'
        """, (now, req.commission_ids))

        # Update affiliate stats
        cur.execute("""
            UPDATE affiliates a
            SET total_paid = total_paid + (
                SELECT COALESCE(SUM(amount), 0)
                FROM commissions
                WHERE id = ANY(%s) AND inviter_id = a.user_id
            ),
            last_payout_at = %s
            WHERE user_id IN (
                SELECT DISTINCT inviter_id FROM commissions WHERE id = ANY(%s)
            )
        """, (req.commission_ids, now, req.commission_ids))

        conn.commit()
        return {"message": "Commissions marked as paid"}

# Webhook for topup (llamado desde New-API backend)
@app.post("/api/webhook/topup")
async def webhook_topup(
    data: dict,
    x_webhook_secret: str = Header(None),
    conn=Depends(get_db)
):
    # Validate secret
    expected_secret = os.getenv("WEBHOOK_SECRET")
    if not expected_secret or x_webhook_secret != expected_secret:
        raise HTTPException(401, "Invalid webhook secret")

    user_id = data.get("user_id")
    amount = data.get("amount")  # quota amount
    topup_id = data.get("topup_id")

    if not all([user_id, amount]):
        raise HTTPException(400, "Missing required fields")

    now = int(datetime.now().timestamp())

    with conn.cursor() as cur:
        # Get inviter
        cur.execute("SELECT inviter_id FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()

        if not user or not user["inviter_id"]:
            return {"message": "No inviter"}

        inviter_id = user["inviter_id"]
        commission_amount = int(amount * COMMISSION_RATE)

        # Create commission record
        cur.execute("""
            INSERT INTO commissions
            (user_id, inviter_id, amount, source_type, source_id, commission_rate, created_at)
            VALUES (%s, %s, %s, 'topup', %s, %s, %s)
        """, (user_id, inviter_id, commission_amount, topup_id, float(COMMISSION_RATE * 100), now))

        # Update inviter stats
        cur.execute("""
            UPDATE users
            SET aff_quota = aff_quota + %s,
                aff_history_quota = aff_history_quota + %s
            WHERE id = %s
        """, (commission_amount, commission_amount, inviter_id))

        conn.commit()
        return {"message": "Commission recorded", "amount": commission_amount}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
