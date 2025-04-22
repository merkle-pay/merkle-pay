# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**輕鬆在 Solana、Polygon、Arbitrum 和 zkSync 上接受穩定幣支付——專為創作者、獨立開發者和小型企業打造。**

Merkle Pay 是一個非託管的網路平台，使用者可以快速設定支付頁面，以便在**多個區塊鏈**上直接接收 USDT 和 USDC 等穩定幣到自己的錢包。

利用原生區塊鏈支付標準（如 Solana Pay 和 EIP-681），它在所有支援的鏈上提供快速交易、極低的網路費用和流暢的使用者體驗。

Merkle Pay 根據 [MIT 授權條款](LICENSE) 完全開源。

---

## 支援的區塊鏈 (v1)

Merkle Pay 旨在在高吞吐量、低費用的網路上提供無縫的支付體驗：

- ✅ **Solana**
- ✅ **Base** _(即將推出)_
- ✅ **Sui** _(即將推出)_
- ✅ **TRON** _(即將推出)_
- ✅ **Polygon PoS** _(即將推出)_
- ✅ **Arbitrum One** _(即將推出)_
- ✅ **zkSync Era** _(即將推出)_

_（未來可能會增加對其他鏈的支援。）_

---

## 支援的錢包 (v1 - 重點關注 Solana)

錢包相容性確保為您的客戶提供流暢的支付體驗。

- ✅ **Phantom**：推薦用於桌面（透過 QR code）和行動裝置（透過 deeplinking）。出色的 Solana Pay 支援。
- ✅ **Solflare**：推薦用於桌面和行動裝置。強大的 Solana Pay 支援。
- **其他 Solana 錢包**：實作 Solana Pay 標準的錢包*應該*相容，但 Phantom 和 Solflare 是 v1 版本主要測試的錢包。
- **EVM 錢包 (MetaMask 等)**：隨著 Polygon、Arbitrum 和 zkSync 整合的完成，將詳細說明對 EVM 錢包的支援。

## 特性 (v1)

- **多鏈支援**：在 Solana 和領先的以太坊 Layer 2 網路（Polygon、Arbitrum、zkSync Era）上接受付款。
- **即時設定**：輸入您的錢包地址和企業名稱——幾分鐘內即可準備好支付頁面。
- **非託管**：付款直接從付款人的錢包轉到您指定的錢包地址。Merkle Pay 絕不持有您的資金。
- **原生支付標準**：Solana 使用 Solana Pay，EVM 鏈（Polygon、Arbitrum、zkSync）使用 EIP-681 URI 方案。
- **智慧顯示**：產生與每個支援鏈上的流行錢包（例如 Phantom、MetaMask）相容的 QR code 和可點擊支付連結。
- **可靠追蹤**：使用唯一的鏈上識別碼（Solana 上的 `reference` 金鑰，EVM 上可能透過合約的事件發射）進行可靠的後端驗證。包括可選的 `orderId` 對應。
- **即時狀態**：具有即時更新的支付狀態頁面（推薦使用 WebSocket）。
- **專注於穩定幣**：主要為 USDT、USDC 以及在支援的鏈上原生或橋接的主要穩定幣設計。
- **開源和可自架設**：使用 Docker 部署或手動部署到 Vercel 等平台。

---

## 開始使用

### 本地開發先決條件

- **Node.js**：推薦 v22+
- **PNPM**：v10.6.4
- **PostgreSQL**：執行中的實例（本地或託管）
- **Web3 錢包**：
  - **Solana:** Phantom, Solflare 等
  - **EVM (Polygon/Arbitrum/zkSync):** 即將推出

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

    # 步驟 1
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # 步驟 2
    touch apps/merkle-dashboard/.env.development
    echo "VITE_DEV=true" > apps/merkle-dashboard/.env.development
    ```

4.  **資料庫遷移**

    ```bash
    cd apps/merkle-pay
    make prisma-gen
    make prisma-migrate NAME=您的_遷移名稱
    make prisma-deploy # 密碼是 yesyesyes
    ```

5.  **本地執行**
    ```bash
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
    # 編輯 .env 檔案並加入您的環境變數
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    ```

3.  **執行**
    ```bash
    make d-up
    ```

---

## 貢獻

- 熱烈歡迎 PR 和 Issues！

---

## 授權條款

Merkle Pay 根據 [MIT 授權條款](LICENSE) 授權。
