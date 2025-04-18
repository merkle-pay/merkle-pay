# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**Solana、Polygon、Arbitrum、zkSync でステーブルコイン決済を簡単に受け入れ—クリエイター、インディーハッカー、スモールビジネス向けに構築。**

Merkle Pay は、ユーザーが支払いページを迅速に設定し、USDT や USDC のようなステーブルコインを**複数のブロックチェーン**上で直接自分のウォレットに受け取ることができる、非管理型のウェブプラットフォームです。

ネイティブなブロックチェーン決済標準（Solana Pay や EIP-681 など）を活用し、サポートされているすべてのチェーンで高速な取引、極めて低いネットワーク手数料、スムーズなユーザーエクスペリエンスを提供します。

Merkle Pay は [MIT ライセンス](LICENSE) の下で完全にオープンソースです。

---

## 対応ブロックチェーン (v1)

Merkle Pay は、高スループット、低手数料のネットワーク全体でシームレスな支払い体験を提供することを目指しています：

- ✅ **Solana**
- ✅ **TRON** _(近日対応予定)_
- ✅ **Polygon PoS** _(近日対応予定)_
- ✅ **Arbitrum One** _(近日対応予定)_
- ✅ **zkSync Era** _(近日対応予定)_

_（将来的には追加のチェーンへの対応が追加される可能性があります。）_

---

## 対応ウォレット (v1 - Solana フォーカス)

ウォレットの互換性は、顧客にとってスムーズな支払い体験を保証します。

- ✅ **Phantom**: デスクトップ（QR コード経由）とモバイル（ディープリンク経由）の両方に推奨。優れた Solana Pay サポート。
- ✅ **Solflare**: デスクトップとモバイルの両方に推奨。強力な Solana Pay サポート。
- **その他の Solana ウォレット**: Solana Pay 標準を実装しているウォレットは互換性があるはずですが、v1 では Phantom と Solflare が主にテストされたウォレットです。
- **EVM ウォレット (MetaMask など)**: Polygon、Arbitrum、zkSync の統合が完了次第、EVM ウォレットのサポートについて詳細を説明します。

## 機能 (v1)

- **マルチチェーン対応**: Solana および主要な Ethereum Layer 2 ネットワーク（Polygon、Arbitrum、zkSync Era）での支払いを受け付けます。
- **即時セットアップ**: ウォレットアドレスとビジネス名を入力するだけで、数分で支払いページの準備ができます。
- **非管理型**: 支払いは支払人のウォレットから指定されたウォレットアドレスに直接送金されます。Merkle Pay が資金を保持することはありません。
- **ネイティブ決済標準**: Solana では Solana Pay を、EVM チェーン（Polygon、Arbitrum、zkSync）では EIP-681 URI スキームを使用します。
- **スマート表示**: 各対応チェーンの人気ウォレット（例：Phantom、MetaMask）と互換性のある QR コードとクリック可能な支払いリンクを生成します。
- **信頼性の高い追跡**: 固有のオンチェーン識別子（Solana の `reference` キー、EVM のコントラクトからのイベント発行の可能性）を使用して、堅牢なバックエンド検証を行います。オプションの `orderId` マッピングを含みます。
- **リアルタイムステータス**: リアルタイム更新付きの支払いステータスページ（WebSocket 推奨）。
- **ステーブルコインフォーカス**: 主に USDT、USDC、および対応チェーン全体でネイティブまたはブリッジされた他の主要なステーブルコイン向けに設計されています。
- **オープンソース＆セルフホスト可能**: Docker を使用してデプロイするか、Vercel などのプラットフォームに手動でデプロイします。

---

## はじめに

### ローカル開発の前提条件

- **Node.js**: v22+ 推奨
- **PNPM**: v10.6.4
- **PostgreSQL**: 実行中のインスタンス（ローカルまたはホスト型）
- **Web3 ウォレット**:
  - **Solana:** Phantom, Solflare など
  - **EVM (Polygon/Arbitrum/zkSync):** 近日対応予定

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

    # 1 つ目
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # 2 つ目
    touch apps/merkle-dashboard/.env.development
    # VITE_TURNSTILE_SITE_KEY=あなたの_CLOUDFLARE_TURNSTILE_サイトキー
    # VITE_DEV=true
    ```

4.  **データベースマイグレーション**

    ```bash
    cd apps/merkle-pay
    make prisma-gen
    make prisma-migrate NAME=あなたの_マイグレーション名
    make prisma-deploy # パスワードは yesyesyes
    ```

5.  **ローカルで実行する**
    ```bash
    make dev
    ```

---

## 本番環境へのデプロイ

- 近日対応予定

---

## 貢献

- PR や Issue を歓迎します！

---

## ライセンス

Merkle Pay は [MIT ライセンス](LICENSE) の下でライセンスされています。
