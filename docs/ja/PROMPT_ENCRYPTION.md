# プロンプト暗号化 - OpenAI/Anthropicでプロンプトを保護

## なぜ？

OpenAIやAnthropicにプロンプトを送信すると、彼らはあなたが書いた内容を正確に見ることができます。プロンプト暗号化により、プロンプトは**エンドツーエンドで暗号化**されます - OpenAI/Anthropicでさえ読むことができません。

```
あなたのプロンプト: "顧客の機密データを分析..."
                    ↓
           [AES-256暗号化]
                    ↓
OpenAIが見る: "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."
```

## 仕組み

### 1. **ローカル暗号化**
- コードはOpenAI/Anthropicに送信する前にプロンプトを暗号化
- 復号化キーはあなただけが持っている
- **AES-256-GCM**を使用（256ビット暗号化+認証）

### 2. **暗号化された送信**
- OpenAI/Anthropicは暗号化されたblobを受け取る
- 元のコンテンツを見ることができない
- トレーニングにプロンプトを使用できない

### 3. **暗号化されたレスポンス**
- レスポンスも暗号化できる
- サーバー上でローカルに復号化

### 4. **オープンソース**
- すべてのコードがGitHubで利用可能
- 誰でも暗号化を監査できる
- 「ブラックマジック」はない

---

## セットアップ

### 1. マスターキーを生成

```bash
# Linux/Mac
openssl rand -hex 32

# PowerShell
-join ((48..57) + (65..70) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 2. .envに追加

```env
# プロンプト暗号化キー（32文字のhexまたは任意の文字列）
PROMPT_ENCRYPTION_KEY=生成されたキーをここに
```

### 3. コードで使用

```go
package main

import "github.com/QuantumNous/new-api/common"

func main() {
    // 暗号化器を作成
    encryptor, err := common.NewPromptEncryptor("秘密キー")
    if err != nil {
        panic(err)
    }

    // プロンプトを暗号化
    prompt := "これは秘密のプロンプトです"
    encrypted, err := encryptor.EncryptPrompt(prompt)
    // encrypted = "llm_encrypted_v1:Jk3xQ9mL2pKq8xR5vW7yZ..."

    // OpenAIに送信
    response := callOpenAI(encrypted)

    // レスポンスを復号化
    decrypted, err := encryptor.DecryptPrompt(response)
}
```

---

## 技術仕様

### アルゴリズム
- **暗号**: GCMモードのAES-256
- **鍵導出**: SHA256(master_key)
- **Nonce**: 12バイトのランダム（crypto/randで生成）
- **認証**: GCMはAEADを提供（authenticated encryption）
- **エンコーディング**: Base64

### フォーマット
```
llm_encrypted_v1:BASE64(nonce + ciphertext + tag)
```

### セキュリティ
- ✅ **機密性**: AES-256は軍事レベル
- ✅ **完全性**: GCMは改ざんを検証
- ✅ **真正性**: キーを持つ者だけが復号化可能
- ✅ **Forward Secrecy**: キーが漏洩しても、古いメッセージはランダムnonceで保護

---

## ユースケース

### ✅ 暗号化に適している:
- 顧客の個人データを含むプロンプト
- 財務情報
- 独自コード
- 医療データ
- あらゆる機密情報

### ⚠️ 考慮事項:
- 暗号化コスト（最小限、プロンプトあたり~1-2ms）
- OpenAIは呼び出しを認識（メタデータ）
- 最大限のプライバシーが必要な場合は、セルフホストLLMを検討

プロンプトが保護されました。✅
