#!/bin/bash
# Script de deployment rápido para Render

set -e

echo "🚀 Deploying Affiliate System to Render..."

# 1. Verificar archivos necesarios
echo "✓ Checking files..."
required_files=(
  "affiliate-api/main.py"
  "affiliate-api/requirements.txt"
  "affiliate-api/Procfile"
  "affiliate-api/runtime.txt"
  "affiliate-api/dashboard.html"
  "affiliate-api/admin.html"
  "affiliate_system.sql"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

echo "✓ All files present"

# 2. Generar secrets si no existen
if [ ! -f ".env.affiliate" ]; then
  echo "🔐 Generating secrets..."
  JWT_SECRET=$(openssl rand -hex 32)
  WEBHOOK_SECRET=$(openssl rand -hex 32)

  cat > .env.affiliate <<EOF
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=$JWT_SECRET
WEBHOOK_SECRET=$WEBHOOK_SECRET
COMMISSION_RATE=0.30
PORT=8080
EOF

  echo "✓ Created .env.affiliate - EDIT DATABASE_URL antes de deploy!"
  echo "⚠️  JWT_SECRET: $JWT_SECRET"
  echo "⚠️  WEBHOOK_SECRET: $WEBHOOK_SECRET"
fi

# 3. Test local básico
echo "🧪 Testing Python syntax..."
cd affiliate-api
python3 -m py_compile main.py
echo "✓ main.py syntax OK"
cd ..

# 4. Instrucciones deployment
cat <<EOF

✅ Pre-deployment check complete!

📋 Next steps:

1. Push código a Git:
   git add .
   git commit -m "Add affiliate system"
   git push

2. Render Web Service:
   - New Web Service → Connect repo
   - Root Directory: affiliate-api
   - Build Command: pip install -r requirements.txt
   - Start Command: python main.py

3. Environment Variables en Render:
   $(cat .env.affiliate)

4. Deploy Base de Datos:
   psql \$DATABASE_URL < affiliate_system.sql

5. Actualizar New-API:
   - Agregar webhook route en router/api-router.go
   - Ver WEBHOOK_INTEGRATION.md

6. Verificar:
   curl https://tu-api.onrender.com/health

📄 Docs completas: DEPLOYMENT_AFFILIATE.md

EOF
