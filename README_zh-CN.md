# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**轻松在 Solana、Base、SUI、TRON、Polygon、Arbitrum、Optimism 等稳定币支付——专为创作者、独立开发者和小企业打造。**

Merkle Pay 是一个非托管的网络平台，用户可以快速设置支付页面，以便在**多个区块链**上直接接收 USDT 和 USDC 等稳定币到自己的钱包。

利用原生区块链支付标准（如 Solana Pay 和 EIP-681），它在所有支持的链上提供快速交易、极低的网络费用和流畅的用户体验。

Merkle Pay 根据 [MIT 许可证](LICENSE) 完全开源。

---

## 支持的区块链 & 状态

Merkle Pay 旨在在高吞吐量、低费用的网络上提供无缝的支付体验：

- ✅ **Solana** (已上线 & 完全支持)
  - 原生 SOL, USDC, USDT 支付已确认。
- ⏳ **Base** (下一个重点 - 进行中)
  - 使用 EIP-681 的 EVM 集成正在积极开发中。
- ⏳ **Polygon PoS** (计划中)
- ⏳ **Arbitrum One** (计划中)
- ⏳ **Optimism** (计划中)
- ◻️ **Sui** (未来考虑)
- ◻️ **TRON** (未来考虑)

_（根据开发进度和社区需求，可能会增加对其他链的支持。）_

---

## 支持的钱包 & 交互方法

钱包兼容性确保为您的客户提供流畅的支付体验。

**Solana:**

- ✅ **Phantom**: 支持所有交互方法：
  - QR Code 扫描 (通过 Solana Pay)
  - 桌面浏览器扩展调用
  - 移动 Deeplinking / Universal Links
- ✅ **Solflare**: 支持所有交互方法：
  - QR Code 扫描 (通过 Solana Pay)
  - 桌面浏览器扩展调用
  - 移动 Deeplinking / Universal Links
- **其他 Solana 钱包**：实现 Solana Pay 标准的钱包*应该*与 QR Code 扫描兼容。Deeplinking 和扩展支持可能有所不同。

**EVM (Base, Polygon, Arbitrum, Optimism - _即将推出_):**

- 目标钱包包括 **MetaMask**, **Rabby**, **Phantom (EVM)**, **Coinbase Wallet**, 以及其他通过 QR Code 扫描或链接处理支持 **EIP-681** 支付请求标准的钱包。

---

## 特性

- **多链支持**：在 Solana 上完全可用；EVM 支持（首先是 Base，然后是其他链）正在积极开发中。
- **即时设置**：输入您的钱包地址和企业名称——几分钟内即可准备好支付页面。
- **非托管**：付款直接从付款人的钱包转到您指定的钱包地址。Merkle Pay 绝不持有您的资金。
- **全面的 Solana 支付**：
  - 通过 Phantom 和 Solflare 扫描 QR Code (Solana Pay Protocol)
  - Phantom 钱包 Chrome 扩展程序连接并发送交易
  - Phantom 应用 Deeplink 连接并发送交易
- **EVM 的 EIP-681 标准**：为 EVM 链（Base, Polygon 等）生成与主流钱包兼容的标准 `ethereum:` 支付 URI/QR Code。
- **可靠的链下跟踪**：通过后端监控将商家的 `orderId` 与已确认的区块链交易 (`txHash`) 关联，并将关系安全地存储在您的 PostgreSQL 数据库中。
- **独特的支付区分**：对 EVM 支付使用金额随机化（"分钱技巧"）并利用 Solana Pay 的引用机制来可靠地区分可能同时发生的支付，确保在数据库中准确映射。
- **专注于稳定币**：主要为 USDT、USDC 以及在支持的链上原生链资产（如 SOL）设计。
- **开源和可自托管**：使用 Docker 部署或手动部署到 Vercel 等平台。
- **基本 UI**：利用 Arco Design 实现干净、实用的界面。（目前重点是功能性，欢迎对 UI 的贡献！)

---

## 开始使用

### 本地开发先决条件

- **Node.js**：推荐 v22+
- **PNPM**：v10.6.4
- **PostgreSQL**：运行中的实例（本地或托管）
- **Web3 钱包**：
  - **Solana:** Phantom, Solflare 等 (确保您有 devnet SOL/代币用于测试)
  - **EVM (Base/Polygon/等):** MetaMask 或类似钱包 (一旦添加 EVM 支持)
  - **Sui:** (一旦添加 Sui 支持)

### 为什么选择 PostgreSQL？

- **数据完整性**：关系结构和约束（如外键）确保数据一致性，这对于跨不同链准确地将支付与商户关联至关重要。
- **事务可靠性 (ACID)**：保证操作（如更新支付状态）完全完成或完全不执行，这对于金融应用程序至关重要。
- **结构化查询**：随着平台的发展，SQL 提供了强大且标准的方式来查询和分析支付数据。
- **成熟的生态系统**：Node.js/TypeScript 生态系统中优秀的工具和 ORM 支持（例如 Prisma）。

### 本地开发安装与设置

1.  **克隆仓库**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **安装依赖**
    _（推荐使用 make）_

    ```bash
    # 使用 make
    make i
    # 或者手动使用 pnpm
    pnpm install
    ```

3.  **配置环境变量**

    ```bash
    # 本地开发需要两个 .env 文件

    # 步骤 1: 后端配置
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env


    # 步骤 2: 前端开发标志
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

4.  **数据库设置 & 迁移**

    ```bash
    cd apps/merkle-pay
    # 生成 Prisma 客户端
    make prisma-gen
    # 将迁移应用到数据库 (密码是 'yesyesyes')
    make prisma-deploy
    ```

5.  **本地运行**
    ```bash
    # 在根目录中
    make dev
    ```

---

### 生产环境部署

0.  **安装 docker**

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```

1.  **克隆仓库**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **配置环境变量**

    ```bash
    # 编辑 .env 文件并添加您的生产环境变量 (DB 连接、密钥等)
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

3.  **使用 Docker Compose 构建并运行**
    ```bash
    # 构建镜像并在分离模式下启动容器
    make d-up
    # 停止: make d-down
    # 查看日志: make d-logs
    ```

---

## 贡献

- 热烈欢迎 PR 和 Issues！
- 重点领域包括 EVM 链集成、UI 改进和额外的钱包支持。
- 这份简体中文 README 由 AI 翻译。如果您发现任何错误，请提交 Pull Request。

---

## 许可证

Merkle Pay 根据 [MIT 许可证](LICENSE) 授权。
