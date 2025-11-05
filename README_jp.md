# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**Solana、Base、SUI、Polygon、Arbitrum、Optimism などでステーブルコイン決済を簡単に受け入れ—クリエイター、インディーハッカー、スモールビジネス向けに構築。**

Merkle Pay は、ユーザーが支払いページを迅速に設定し、USDT や USDC のようなステーブルコインを**複数のブロックチェーン**上で直接自分のウォレットに受け取ることができる、非管理型のウェブプラットフォームです。

ネイティブなブロックチェーン決済標準（Solana Pay や EIP-681 など）を活用し、サポートされているすべてのチェーンで高速な取引、極めて低いネットワーク手数料、スムーズなユーザーエクスペリエンスを提供します。

Merkle Pay は [MIT ライセンス](LICENSE) の下で完全にオープンソースです。

---

## 対応ブロックチェーン & ステータス

Merkle Pay は、高スループット、低手数料のネットワーク全体でシームレスな支払い体験を提供することを目指しています：

- ✅ **Solana** (ライブ & 完全サポート)
  - ネイティブ SOL, USDC, USDT 支払い確認済み。
- ⏳ **Base** (次の焦点 - 進行中)
  - EIP-681 を使用した EVM 統合を積極的に開発中。
- ⏳ **Polygon PoS** (計画中)
- ⏳ **Arbitrum One** (計画中)
- ⏳ **Optimism** (計画中)
- ◻️ **Sui** (将来検討)

_（開発の進捗状況やコミュニティの要望に応じて、追加のチェーンへの対応が追加される可能性があります。）_

---

## 対応ウォレット & インタラクション方法

ウォレットの互換性は、顧客にとってスムーズな支払い体験を保証します。

**Solana:**

- ✅ **Phantom**: すべてのインタラクション方法をサポート:
  - QRコードスキャン (Solana Pay 経由)
  - デスクトップブラウザ拡張機能呼び出し
  - モバイルディープリンク / ユニバーサルリンク
- ✅ **Solflare**: すべてのインタラクション方法をサポート:
  - QRコードスキャン (Solana Pay 経由)
  - デスクトップブラウザ拡張機能呼び出し
  - モバイルディープリンク / ユニバーサルリンク
- **その他の Solana ウォレット**: Solana Pay 標準を実装しているウォレットは、QR コードスキャンと互換性がある*はず*です。ディープリンクと拡張機能のサポートは異なる場合があります。

**EVM (Base, Polygon, Arbitrum, Optimism - _近日対応予定_):**

- 対象ウォレットには、**MetaMask**, **Rabby**, **Phantom (EVM)**, **Coinbase Wallet**、および QR コードスキャンまたはリンク処理を介して **EIP-681** 支払いリクエスト標準をサポートするその他のウォレットが含まれます。

---

## 機能

- **マルチチェーン対応**: Solana で完全に機能。EVM サポート (最初に Base、次にその他) を積極的に開発中。
- **即時セットアップ**: ウォレットアドレスとビジネス名を入力するだけで、数分で支払いページの準備ができます。
- **非管理型**: 支払いは支払人のウォレットから指定されたウォレットアドレスに直接送金されます。Merkle Pay が資金を保持することはありません。
- **包括的な Solana 決済**:
  - Phantom と Solflare を介した QR コードスキャン (Solana Pay プロトコル)
  - Phantom ウォレット Chrome 拡張機能による接続とトランザクション送信
  - Phantom アプリのディープリンクによる接続とトランザクション送信
- **EVM 向け EIP-681 標準**: 主要なウォレットと互換性のある EVM チェーン (Base、Polygon など) 用の標準 `ethereum:` 支払い URI/QR コードを生成します。
- **堅牢なオフチェーントラッキング**: バックエンド監視を介してマーチャントの `orderId` を確認済みのブロックチェーントランザクション (`txHash`) にリンクし、その関係を PostgreSQL データベースに安全に保存します。
- **独自の支払い明確化**: EVM 支払いには金額のランダム化 (「セントトリック」) を使用し、Solana Pay の参照メカニズムを活用して、潜在的に同時に行われる支払いを確実に区別し、データベースでの正確なマッピングを保証します。
- **ステーブルコインフォーカス**: 主に USDT、USDC、およびサポートされているチェーン上のネイティブチェーンアセット (SOL など) 向けに設計されています。
- **オープンソース＆セルフホスト可能**: Docker を使用してデプロイするか、Vercel などのプラットフォームに手動でデプロイします。
- **モダン UI**: Shadcn/UI と Radix UI コンポーネントを使用して、TailwindCSS でクリーンでアクセシブルなインターフェースを構築しています。

---

## はじめに

### ローカル開発の前提条件

- **Node.js**: v22+ 推奨
- **PNPM**: v10.6.4
- **PostgreSQL**: 実行中のインスタンス（ローカルまたはホスト型）
- **Web3 ウォレット**:
  - **Solana:** Phantom, Solflare など (テスト用に devnet SOL/トークンがあることを確認)
  - **EVM (Base/Polygon/など):** MetaMask または類似のもの (EVM サポートが追加され次第)
  - **Sui:** (Sui サポートが追加され次第)

### なぜ PostgreSQL なのか？

- **データ整合性**: リレーショナル構造と制約（外部キーなど）により、データの整合性が保証されます。これは、異なるチェーン間で支払いを正確にマーチャントにリンクするために不可欠です。
- **トランザクションの信頼性 (ACID)**: 操作（支払いステータスの更新など）が完全に完了するか、まったく実行されないことを保証します。これは金融アプリケーションにとって極めて重要です。
- **構造化クエリ**: SQL は、プラットフォームの成長に合わせて支払いデータをクエリおよび分析するための強力で標準的な方法を提供します。
- **成熟したエコシステム**: Node.js/TypeScript エコシステムにおける優れたツールと ORM サポート（例：Prisma）。

### ローカル開発のためのインストールとセットアップ

1.  **リポジトリをクローンする**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **依存関係をインストールする**
    _（make の使用を推奨）_

    ```bash
    # make を使用する場合
    make i
    # または pnpm で手動で
    pnpm install
    ```

3.  **環境変数を設定する**

    ```bash
    # ローカル開発には 2 つの .env ファイルが必要です

    # ステップ 1: バックエンド設定
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env

    # ステップ 2: フロントエンド開発フラグ
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

4.  **データベースのセットアップとマイグレーション**

    ```bash
    cd apps/merkle-pay
    # Prisma クライアントを生成
    make prisma-gen
    # データベースにマイグレーションを適用 (パスワードは 'yesyesyes')
    make prisma-deploy
    ```

5.  **ローカルで実行する**
    ```bash
    # ルートディレクトリで
    make dev
    ```

---

### 本番環境へのデプロイ

0.  **docker をインストールする**

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```

1.  **リポジトリをクローンする**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **環境変数を設定する**

    ```bash
    # .env ファイルを編集して本番環境の環境変数を追加します (DB 接続、シークレットなど)
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

3.  **Docker Compose でビルドして実行する**
    ```bash
    # イメージをビルドし、デタッチモードでコンテナを開始
    make d-up
    # 停止する場合: make d-down
    # ログを表示する場合: make d-logs
    ```

---

## 貢献

- PR や Issue を歓迎します！
- 重点分野には、EVM チェーン統合、UI 改善、追加のウォレットサポートが含まれます。
- この日本語の README は AI によって翻訳されました。誤りを見つけた場合は、プルリクエストを開いてください。

---

## ライセンス

Merkle Pay は [MIT ライセンス](LICENSE) の下でライセンスされています。
