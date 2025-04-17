# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**轻松在 Solana、Polygon、Arbitrum 和 zkSync 上接受稳定币支付——专为创作者、独立开发者和小企业打造。**

Merkle Pay 是一个非托管的网络平台，用户可以快速设置支付页面，以便在**多个区块链**上直接接收 USDT 和 USDC 等稳定币到自己的钱包。

利用原生区块链支付标准（如 Solana Pay 和 EIP-681），它在所有支持的链上提供快速交易、极低的网络费用和流畅的用户体验。

Merkle Pay 根据 [MIT 许可证](LICENSE) 完全开源。

---

## 支持的区块链 (v1)

Merkle Pay 旨在在高吞吐量、低费用的网络上提供无缝的支付体验：

- ✅ **Solana**
- ✅ **TRON** _(即将推出)_
- ✅ **Polygon PoS** _(即将推出)_
- ✅ **Arbitrum One** _(即将推出)_
- ✅ **zkSync Era** _(即将推出)_

_（未来可能会增加对其他链的支持。）_

---

## 支持的钱包 (v1 - 重点关注 Solana)

钱包兼容性确保为您的客户提供流畅的支付体验。

- ✅ **Phantom**：推荐用于桌面（通过二维码）和移动设备（通过深度链接）。出色的 Solana Pay 支持。
- ✅ **Solflare**：推荐用于桌面和移动设备。强大的 Solana Pay 支持。
- **其他 Solana 钱包**：实现 Solana Pay 标准的钱包*应该*兼容，但 Phantom 和 Solflare 是 v1 版本主要测试的钱包。
- **EVM 钱包 (MetaMask 等)**：随着 Polygon、Arbitrum 和 zkSync 集成的完成，将详细说明对 EVM 钱包的支持。

## 特性 (v1)

- **多链支持**：在 Solana 和领先的以太坊 Layer 2 网络（Polygon、Arbitrum、zkSync Era）上接受付款。
- **即时设置**：输入您的钱包地址和企业名称——几分钟内即可准备好支付页面。
- **非托管**：付款直接从付款人的钱包转到您指定的钱包地址。Merkle Pay 绝不持有您的资金。
- **原生支付标准**：Solana 使用 Solana Pay，EVM 链（Polygon、Arbitrum、zkSync）使用 EIP-681 URI 方案。
- **智能显示**：生成与每个支持链上的流行钱包（例如 Phantom、MetaMask）兼容的二维码和可点击支付链接。
- **可靠跟踪**：使用唯一的链上标识符（Solana 上的 `reference` 键，EVM 上可能通过合约的事件发射）进行可靠的后端验证。包括可选的 `orderId` 映射。
- **实时状态**：具有实时更新的支付状态页面（推荐使用 WebSocket）。
- **专注于稳定币**：主要为 USDT、USDC 以及在支持的链上原生或桥接的主要稳定币设计。
- **开源和可自托管**：使用 Docker 部署或手动部署到 Vercel 等平台。

---

## 开始使用

### 本地开发先决条件

- **Node.js**：推荐 v22+
- **PNPM**：v10.6.4
- **PostgreSQL**：运行中的实例（本地或托管）
- **Web3 钱包**：
  - **Solana:** Phantom, Solflare 等
  - **EVM (Polygon/Arbitrum/zkSync):** 即将推出

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
    _（如果您是 monorepo 结构，推荐使用 PNPM）_

    ```bash
    # 使用 make
    make i
    # 或者手动使用 pnpm
    pnpm install
    ```

3.  **配置环境变量**

    ```bash
    # 本地开发需要两个 .env 文件

    # 第一个
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # 第二个
    touch apps/merkle-dashboard/.env.development
    # VITE_TURNSTILE_SITE_KEY=你的Cf Turnstile 站点密钥
    # VITE_DEV=true
    ```

4.  **数据库迁移**

    ```bash
    cd apps/merkle-pay
    make prisma-gen
    make prisma-migrate NAME=你的_迁移名称
    make prisma-deploy # 密码是 yesyesyes
    ```

5.  **本地运行**
    ```bash
    make dev
    ```

---

## 生产环境部署

- 即将推出

---

## 贡献

- 热烈欢迎 PR 和 Issues！

---

## 许可证

Merkle Pay 根据 [MIT 许可证](LICENSE) 授权。
