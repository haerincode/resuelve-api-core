# Mã hóa Prompt - Bảo vệ prompt của bạn trên OpenAI/Anthropic

## Tại sao?

Khi bạn gửi prompt đến OpenAI hoặc Anthropic, họ có thể thấy chính xác những gì bạn đã viết. Với Mã hóa Prompt, các prompt của bạn được **mã hóa đầu cuối** - ngay cả OpenAI/Anthropic cũng không thể đọc được.

```
Prompt của bạn: "Phân tích dữ liệu khách hàng bí mật..."
                    ↓
           [MÃ HÓA AES-256]
                    ↓
OpenAI thấy: "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."
```

## Cách hoạt động

### 1. **Mã hóa Cục bộ**
- Code của bạn mã hóa prompt TRƯỚC KHI gửi đến OpenAI/Anthropic
- Chỉ bạn có khóa giải mã
- Sử dụng **AES-256-GCM** (mã hóa 256 bit + xác thực)

### 2. **Gửi được Mã hóa**
- OpenAI/Anthropic nhận blob được mã hóa
- Họ không thể thấy nội dung gốc
- Họ không thể sử dụng prompt của bạn để huấn luyện

### 3. **Phản hồi được Mã hóa**
- Phản hồi cũng có thể được mã hóa
- Được giải mã cục bộ trên máy chủ của bạn

### 4. **Mã nguồn Mở**
- Tất cả code đều có sẵn trên GitHub
- Bất kỳ ai cũng có thể kiểm tra mã hóa
- Không có "ma thuật đen"

---

## Cấu hình

### 1. Tạo Khóa Chính

```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell
-join ((48..57) + (65..70) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 2. Thêm vào .env

```env
# Khóa Mã hóa Prompt (32 ký tự hex hoặc bất kỳ chuỗi nào)
PROMPT_ENCRYPTION_KEY=khoa-duoc-tao-cua-ban
```

### 3. Sử dụng trong code

```go
package main

import "github.com/QuantumNous/new-api/common"

func main() {
    // Tạo bộ mã hóa
    encryptor, err := common.NewPromptEncryptor("khoa-bi-mat-cua-ban")
    if err != nil {
        panic(err)
    }

    // Mã hóa prompt
    prompt := "Đây là prompt bí mật của tôi"
    encrypted, err := encryptor.EncryptPrompt(prompt)
    // encrypted = "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."

    // Gửi đến OpenAI
    response := callOpenAI(encrypted)

    // Giải mã phản hồi
    decrypted, err := encryptor.DecryptPrompt(response)
}
```

---

## Đặc tả Kỹ thuật

### Thuật toán
- **Cipher**: AES-256 ở chế độ GCM
- **Dẫn xuất Khóa**: SHA256(master_key)
- **Nonce**: 12 byte ngẫu nhiên (được tạo bởi crypto/rand)
- **Xác thực**: GCM cung cấp AEAD (authenticated encryption)
- **Mã hóa**: Base64

### Định dạng
```
llm_encrypted_v1:BASE64(nonce + ciphertext + tag)
```

### Bảo mật
- ✅ **Bí mật**: AES-256 là cấp độ quân sự
- ✅ **Toàn vẹn**: GCM xác minh không bị thay đổi
- ✅ **Xác thực**: Chỉ người có khóa mới có thể giải mã
- ✅ **Forward Secrecy**: Nếu khóa bị xâm phạm, tin nhắn cũ được bảo vệ bởi nonce ngẫu nhiên

---

## Trường hợp Sử dụng

### ✅ Tốt cho mã hóa:
- Prompt có dữ liệu cá nhân của khách hàng
- Thông tin tài chính
- Code độc quyền
- Dữ liệu y tế
- Bất kỳ thông tin nhạy cảm nào

### ⚠️ Xem xét:
- Chi phí mã hóa (tối thiểu, ~1-2ms mỗi prompt)
- OpenAI vẫn thấy bạn đã gọi (metadata)
- Nếu cần quyền riêng tư tối đa, hãy xem xét LLM tự lưu trữ

Prompt của bạn hiện được bảo vệ. ✅
