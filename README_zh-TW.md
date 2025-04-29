# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**輕鬆在 Solana、Base、SUI、TRON、Polygon、Arbitrum、Optimism 等穩定幣支付——專為創作者、獨立開發者和小型企業打造。**

Merkle Pay 是一個非託管的網路平台，使用者可以快速設定支付頁面，以便在**多個區塊鏈**上直接接收 USDT 和 USDC 等穩定幣到自己的錢包。

利用原生區塊鏈支付標準（如 Solana Pay 和 EIP-681），它在所有支援的鏈上提供快速交易、極低的網路費用和流暢的使用者體驗。

Merkle Pay 根據 [MIT 授權條款](LICENSE) 完全開源。

---

## 支援的區塊鏈 & 狀態

Merkle Pay 旨在在高吞吐量、低費用的網路上提供無縫的支付體驗：

- ✅ **Solana** (已上線 & 完全支援)
  - 原生 SOL, USDC, USDT 支付已確認。
- ⏳ **Base** (下一個重點 - 進行中)
  - 使用 EIP-681 的 EVM 整合正在積極開發中。
- ⏳ **Polygon PoS** (計劃中)
- ⏳ **Arbitrum One** (計劃中)
- ⏳ **Optimism** (計劃中)
- ◻️ **Sui** (未來考量)
- ◻️ **TRON** (未來考量)

_（根據開發進度和社群需求，可能會增加對其他鏈的支援。）_

---

## 支援的錢包 & 互動方法

錢包相容性確保為您的客戶提供流暢的支付體驗。

**Solana:**

- ✅ **Phantom**: 支援所有互動方法：
  - QR Code 掃描 (透過 Solana Pay)
  - 桌面瀏覽器擴充功能呼叫
  - 行動 Deeplinking / Universal Links
- ✅ **Solflare**: 支援所有互動方法：
  - QR Code 掃描 (透過 Solana Pay)
  - 桌面瀏覽器擴充功能呼叫
  - 行動 Deeplinking / Universal Links
- **其他 Solana 錢包**：實作 Solana Pay 標準的錢包*應該*與 QR Code 掃描相容。Deeplinking 和擴充功能支援可能有所不同。

**EVM (Base, Polygon, Arbitrum, Optimism - _即將推出_):**

- 目標錢包包括 **MetaMask**, **Rabby**, **Phantom (EVM)**, **Coinbase Wallet**, 以及其他透過 QR Code 掃描或連結處理支援 **EIP-681** 支付請求標準的錢包。

---

## 特性

- **多鏈支援**：在 Solana 上完全可用；EVM 支援（首先是 Base，然後是其他鏈）正在積極開發中。
- **即時設定**：輸入您的錢包地址和企業名稱——幾分鐘內即可準備好支付頁面。
- **非託管**：付款直接從付款人的錢包轉到您指定的錢包地址。Merkle Pay 絕不持有您的資金。
- **全面的 Solana 支付**：
  - 透過 Phantom 和 Solflare 掃描 QR Code (Solana Pay Protocol)
  - Phantom 錢包 Chrome 擴充功能連接並傳送交易
  - Phantom 應用程式 Deeplink 連接並傳送交易
- **EVM 的 EIP-681 標準**：為 EVM 鏈（Base, Polygon 等）產生與主流錢包相容的標準 `ethereum:` 支付 URI/QR Code。
- **可靠的鏈下追蹤**：透過後端監控將商家的 `orderId` 與已確認的區塊鏈交易 (`txHash`) 關聯，並將關係安全地儲存在您的 PostgreSQL 資料庫中。
- **獨特的支付區分**：對 EVM 支付使用金額隨機化（「分錢技巧」）並利用 Solana Pay 的引用機制來可靠地區分可能同時發生的支付，確保在資料庫中準確對應。
- **專注於穩定幣**：主要為 USDT、USDC 以及在支援的鏈上原生鏈資產（如 SOL）設計。
- **開源和可自架設**：使用 Docker 部署或手動部署到 Vercel 等平台。
- **基本 UI**：利用 Arco Design 實現乾淨、實用的介面。（目前重點是功能性，歡迎對 UI 的貢獻！)

---

## 開始使用

### 本地開發先決條件

- **Node.js**：推薦 v22+
- **PNPM**：v10.6.4
- **PostgreSQL**：執行中的實例（本地或託管）
- **Web3 錢包**：
  - **Solana:** Phantom, Solflare 等 (確保您有 devnet SOL/代幣用於測試)
  - **EVM (Base/Polygon/等):** MetaMask 或類似錢包 (一旦新增 EVM 支援)
  - **Sui:** (一旦新增 Sui 支援)

### 為什麼選擇 PostgreSQL？

- **資料完整性**：關聯式結構和約束（如 Foreign Keys）確保資料一致性，這對於跨不同鏈準確地將支付與商戶關聯至關重要。
- **交易可靠性 (ACID)**：保證操作（如更新支付狀態）完全完成或完全不執行，這對於金融應用程式至關重要。
- **結構化查詢**：隨著平台的發展，SQL 提供了強大且標準的方式來查詢和分析支付資料。
- **成熟的生態系統**：Node.js/TypeScript 生態系統中優秀的工具和 ORM 支援（例如 Prisma）。

### 本地開發安裝與設定

1.  **克隆儲存庫**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **安裝依賴套件**
    _（推薦使用 make）_

    ```bash
    # 使用 make
    make i
    # 或者手動使用 pnpm
    pnpm install
    ```

3.  **設定環境變數**

    ```bash
    # 本地開發需要兩個 .env 檔案

    # 步驟 1: 後端設定
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # -> 編輯 apps/merkle-pay/.env，填入您的 PostgreSQL 連線字串等。

    # 步驟 2: 前端開發標誌
    touch apps/merkle-dashboard/.env.development
    echo "VITE_DEV=true" > apps/merkle-dashboard/.env.development
    ```

4.  **資料庫設定 & 遷移**

    ```bash
    cd apps/merkle-pay
    # 產生 Prisma 客戶端
    make prisma-gen
    # 將遷移套用到資料庫 (密碼是 'yesyesyes')
    make prisma-deploy
    ```

5.  **本地執行**
    ```bash
    # 在根目錄中
    make dev
    ```

---

### 生產環境部署

0.  **安裝 docker**

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```

1.  **克隆儲存庫**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **設定環境變數**

    ```bash
    # 編輯 .env 檔案並加入您的生產環境變數 (DB 連線、密鑰等)
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # -> 仔細編輯 apps/merkle-pay/.env 以進行生產設定
    ```

3.  **使用 Docker Compose 建置並執行**
    ```bash
    # 建置映像檔並在分離模式下啟動容器
    make d-up
    # 停止: make d-down
    # 查看日誌: make d-logs
    ```

---

## 貢獻

- 熱烈歡迎 PR 和 Issues！
- 重點領域包括 EVM 鏈整合、UI 改進和額外的錢包支援。
- 這份繁體中文 README 由 AI 翻譯。如果您發現任何錯誤，請提交 Pull Request。

---

## 授權條款

Merkle Pay 根據 [MIT 授權條款](LICENSE) 授權。
