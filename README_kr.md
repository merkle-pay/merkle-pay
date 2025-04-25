# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**Solana, Base, Sui, TRON, Polygon, Arbitrum에서 스테이블코인 결제를 쉽게 수락하세요—크리에이터, 인디 해커, 소상공인을 위해 제작되었습니다.**

Merkle Pay는 사용자가 결제 페이지를 빠르게 설정하여 **여러 블록체인**에서 USDT 및 USDC와 같은 스테이블코인을 자신의 지갑으로 직접 받을 수 있도록 지원하는 비수탁형 웹 플랫폼입니다.

네이티브 블록체인 결제 표준(Solana Pay 및 EIP-681 등)을 활용하여 지원되는 모든 체인에서 빠른 거래, 매우 낮은 네트워크 수수료, 원활한 사용자 경험을 제공합니다.

Merkle Pay는 [MIT 라이선스](LICENSE)에 따라 완전히 오픈 소스입니다.

---

## 지원 블록체인 (v1)

Merkle Pay는 처리량이 높고 수수료가 낮은 네트워크 전반에 걸쳐 원활한 결제 경험을 제공하는 것을 목표로 합니다:

- ✅ **Solana**
- ✅ **Base** _(출시 예정)_
- ✅ **Sui** _(출시 예정)_
- ✅ **TRON** _(출시 예정)_
- ✅ **Polygon PoS** _(출시 예정)_
- ✅ **Arbitrum One** _(출시 예정)_

_(향후 추가 체인에 대한 지원이 추가될 수 있습니다.)_

---

## 지원 지갑 (v1 - Solana 중심)

지갑 호환성은 고객에게 원활한 결제 경험을 보장합니다.

- ✅ **Phantom**: 데스크톱(QR 코드 사용) 및 모바일(딥링킹 사용) 모두 권장됩니다. 뛰어난 Solana Pay 지원.
- ✅ **Solflare**: 데스크톱 및 모바일 모두 권장됩니다. 강력한 Solana Pay 지원.
- **기타 Solana 지갑**: Solana Pay 표준을 구현하는 지갑은 호환되어야 하지만, v1에서는 Phantom과 Solflare가 주로 테스트된 지갑입니다.
- **EVM 지갑 (MetaMask 등)**: Base, Polygon, Arbitrum 통합이 완료되면 EVM 지갑 지원에 대해 자세히 설명할 예정입니다.

## 기능 (v1)

- **멀티체인 지원**: Solana 및 주요 이더리움 레이어 2 네트워크(Base, Polygon, Arbitrum)에서 결제를 수락합니다.
- **즉시 설정**: 지갑 주소와 비즈니스 이름을 입력하면 몇 분 안에 결제 페이지가 준비됩니다.
- **비수탁형**: 결제는 지불인의 지갑에서 지정된 지갑 주소로 직접 전송됩니다. Merkle Pay는 귀하의 자금을 절대 보유하지 않습니다.
- **네이티브 결제 표준**: Solana의 경우 Solana Pay를 사용하고 EVM 체인(Base, Polygon, Arbitrum)의 경우 EIP-681 URI 스킴을 사용합니다.
- **스마트 디스플레이**: 각 지원 체인의 인기 있는 지갑(예: Phantom, MetaMask)과 호환되는 QR 코드 및 클릭 가능한 결제 링크를 생성합니다.
- **신뢰할 수 있는 추적**: 고유한 온체인 식별자(Solana의 `reference` 키, EVM의 경우 컨트랙트를 통한 이벤트 발생 가능성)를 사용하여 강력한 백엔드 검증을 수행합니다. 선택적 `orderId` 매핑을 포함합니다.
- **실시간 상태**: 실시간 업데이트가 포함된 결제 상태 페이지 (WebSocket 권장).
- **스테이블코인 중심**: 주로 USDT, USDC 및 지원되는 체인에서 네이티브이거나 브릿지된 기타 주요 스테이블코인을 위해 설계되었습니다.
- **오픈 소스 및 자체 호스팅 가능**: Docker를 사용하여 배포하거나 Vercel과 같은 플랫폼에 수동으로 배포합니다.

---

## 시작하기

### 로컬 개발을 위한 사전 요구 사항

- **Node.js**: v22+ 권장
- **PNPM**: v10.6.4
- **PostgreSQL**: 실행 중인 인스턴스 (로컬 또는 호스팅)
- **Web3 지갑**:
  - **Solana:** Phantom, Solflare 등
  - **EVM (Base/Polygon/Arbitrum):** 출시 예정
  - **Sui:** 출시 예정
  - **TRON:** 출시 예정

### 왜 PostgreSQL인가?

- **데이터 무결성**: 관계형 구조와 제약 조건(외래 키 등)은 데이터 일관성을 보장하며, 이는 여러 체인에서 결제를 판매자와 정확하게 연결하는 데 중요합니다.
- **트랜잭션 신뢰성 (ACID)**: 작업(결제 상태 업데이트 등)이 완전히 완료되거나 전혀 실행되지 않도록 보장하며, 이는 금융 애플리케이션에 필수적입니다.
- **구조화된 쿼리**: SQL은 플랫폼이 성장함에 따라 결제 데이터를 쿼리하고 분석하는 강력하고 표준적인 방법을 제공합니다.
- **성숙한 생태계**: Node.js/TypeScript 생태계의 우수한 도구 및 ORM 지원(예: Prisma).

### 로컬 개발을 위한 설치 및 설정

1.  **저장소 복제**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **의존성 설치**
    _（make 사용 권장）_

    ```bash
    # make 사용
    make i
    # 또는 pnpm으로 수동 설치
    pnpm install
    ```

3.  **환경 변수 구성**

    ```bash
    # 로컬 개발에는 두 개의 .env 파일이 필요합니다

    # 단계 1
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # 단계 2
    touch apps/merkle-dashboard/.env.development
    echo "VITE_DEV=true" > apps/merkle-dashboard/.env.development
    ```

4.  **데이터베이스 마이그레이션**

    ```bash
    cd apps/merkle-pay
    make prisma-gen
    make prisma-migrate NAME=MY_MIGRATION_NAME
    make prisma-deploy # 비밀번호는 yesyesyes 입니다
    ```

5.  **로컬에서 실행**
    ```bash
    make dev
    ```

---

### 프로덕션 환경 배포

0.  **docker 설치**

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```

1.  **저장소 복제**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **환경 변수 구성**

    ```bash
    # .env 파일을 편집하고 환경 변수를 추가하세요
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    ```

3.  **실행**
    ```bash
    make d-up
    ```

---

## 기여

- PR과 이슈는 언제나 환영입니다!

---

## 라이선스

Merkle Pay는 [MIT 라이선스](LICENSE)에 따라 라이선스가 부여됩니다.
