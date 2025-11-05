# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**Solana, Base, SUI, Polygon, Arbitrum, Optimism 등에서 스테이블코인 결제를 쉽게 수락하세요—크리에이터, 인디 해커, 소상공인을 위해 제작되었습니다.**

Merkle Pay는 사용자가 결제 페이지를 빠르게 설정하여 **여러 블록체인**에서 USDT 및 USDC와 같은 스테이블코인을 자신의 지갑으로 직접 받을 수 있도록 지원하는 비수탁형 웹 플랫폼입니다.

네이티브 블록체인 결제 표준(Solana Pay 및 EIP-681 등)을 활용하여 지원되는 모든 체인에서 빠른 거래, 매우 낮은 네트워크 수수료, 원활한 사용자 경험을 제공합니다.

Merkle Pay는 [MIT 라이선스](LICENSE)에 따라 완전히 오픈 소스입니다.

---

## 지원 블록체인 & 상태

Merkle Pay는 처리량이 높고 수수료가 낮은 네트워크 전반에 걸쳐 원활한 결제 경험을 제공하는 것을 목표로 합니다:

- ✅ **Solana** (라이브 & 완전 지원)
  - 네이티브 SOL, USDC, USDT 결제 확인됨.
- ⏳ **Base** (다음 초점 - 진행 중)
  - EIP-681을 사용한 EVM 통합 적극 개발 중.
- ⏳ **Polygon PoS** (계획됨)
- ⏳ **Arbitrum One** (계획됨)
- ⏳ **Optimism** (계획됨)
- ◻️ **Sui** (향후 고려)

_(개발 진행 상황 및 커뮤니티 요구에 따라 추가 체인에 대한 지원이 추가될 수 있습니다.)_

---

## 지원 지갑 & 상호작용 방법

지갑 호환성은 고객에게 원활한 결제 경험을 보장합니다.

**Solana:**

- ✅ **Phantom**: 모든 상호작용 방법 지원:
  - QR 코드 스캔 (Solana Pay 통해)
  - 데스크톱 브라우저 확장 프로그램 호출
  - 모바일 딥링킹 / 유니버설 링크
- ✅ **Solflare**: 모든 상호작용 방법 지원:
  - QR 코드 스캔 (Solana Pay 통해)
  - 데스크톱 브라우저 확장 프로그램 호출
  - 모바일 딥링킹 / 유니버설 링크
- **기타 Solana 지갑**: Solana Pay 표준을 구현하는 지갑은 QR 코드 스캔과 호환*되어야* 합니다. 딥링킹 및 확장 프로그램 지원은 다를 수 있습니다.

**EVM (Base, Polygon, Arbitrum, Optimism - _출시 예정_):**

- 대상 지갑에는 **MetaMask**, **Rabby**, **Phantom (EVM)**, **Coinbase Wallet** 및 QR 코드 스캔 또는 링크 처리를 통해 **EIP-681** 결제 요청 표준을 지원하는 기타 지갑이 포함됩니다.

---

## 기능

- **멀티체인 지원**: Solana에서 완전히 작동; EVM 지원(Base 우선, 그 다음 다른 체인) 적극 개발 중.
- **즉시 설정**: 지갑 주소(들)와 비즈니스 이름을 입력하면 몇 분 안에 결제 페이지가 준비됩니다.
- **비수탁형**: 결제는 지불인의 지갑에서 지정된 지갑 주소로 직접 전송됩니다. Merkle Pay는 귀하의 자금을 절대 보유하지 않습니다.
- **포괄적인 Solana 결제**:
  - Phantom 및 Solflare를 통한 QR 코드 스캔 (Solana Pay 프로토콜)
  - Phantom 지갑 크롬 확장 프로그램 연결 및 거래 전송
  - Phantom 앱 딥링크 연결 및 거래 전송
- **EVM용 EIP-681 표준**: 주요 지갑과 호환되는 EVM 체인(Base, Polygon 등)용 표준 `ethereum:` 결제 URI/QR 코드 생성.
- **견고한 오프체인 추적**: 백엔드 모니터링을 통해 판매자 `orderId`를 확인된 블록체인 거래(`txHash`)에 연결하고 PostgreSQL 데이터베이스에 관계를 안전하게 저장합니다.
- **고유한 결제 명확화**: EVM 결제에 금액 무작위화("센트 트릭")를 사용하고 Solana Pay의 참조 메커니즘을 활용하여 잠재적으로 동시적인 결제를 안정적으로 구별하여 데이터베이스에 정확한 매핑을 보장합니다.
- **스테이블코인 중심**: 주로 USDT, USDC 및 지원되는 체인의 네이티브 체인 자산(예: SOL)을 위해 설계되었습니다.
- **오픈 소스 및 자체 호스팅 가능**: Docker를 사용하여 배포하거나 Vercel과 같은 플랫폼에 수동으로 배포합니다.
- **모던 UI**: TailwindCSS를 사용하여 깨끗하고 접근 가능한 인터페이스를 위해 Shadcn/UI 및 Radix UI 컴포넌트로 구축되었습니다.

---

## 시작하기

### 로컬 개발을 위한 사전 요구 사항

- **Node.js**: v22+ 권장
- **PNPM**: v10.6.4
- **PostgreSQL**: 실행 중인 인스턴스 (로컬 또는 호스팅)
- **Web3 지갑**:
  - **Solana:** Phantom, Solflare 등 (테스트용 devnet SOL/토큰이 있는지 확인)
  - **EVM (Base/Polygon/등):** MetaMask 또는 유사 지갑 (EVM 지원 추가 시)
  - **Sui:** (Sui 지원 추가 시)

### 왜 PostgreSQL인가?

- **데이터 무결성**: 관계형 구조와 제약 조건(외래 키 등)은 데이터 일관성을 보장하며, 이는 여러 체인에서 결제를 판매자와 정확하게 연결하는 데 중요합니다.
- **트랜잭션 신뢰성 (ACID)**: 작업(결제 상태 업데이트 등)이 완전히 완료되거나 전혀 실행되지 않도록 보장하며, 이는 금융 애플리케이션에 필수적입니다.
- **구조화된 쿼리**: SQL은 플랫폼이 성장함에 따라 결제 데이터를 쿼리하고 분석하는 강력하고 표준적인 방법을 제공합니다.
- **성숙한 생태계**: Node.js/TypeScript 생태계의 우수한 도구 및 ORM 지원(예: node-postgres).

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

    # 단계 1: 백엔드 구성
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env

    # 단계 2: 프론트엔드 개발 플래그
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

4.  **데이터베이스 설정 및 마이그레이션**

    ```bash
    # 데이터베이스에 마이그레이션 적용
    make migrate-up
    ```

5.  **로컬에서 실행**
    ```bash
    # 루트 디렉토리에서
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
    # .env 파일을 편집하고 프로덕션 환경 변수를 추가하세요 (DB 연결, 비밀키 등)
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

3.  **Docker Compose로 빌드 및 실행**
    ```bash
    # 이미지를 빌드하고 분리 모드에서 컨테이너 시작
    make d-up
    # 중지하려면: make d-down
    # 로그를 보려면: make d-logs
    ```

---

## 기여

- PR과 이슈는 언제나 환영입니다!
- 주요 초점 분야에는 EVM 체인 통합, UI 개선 및 추가 지갑 지원이 포함됩니다.
- 이 한국어 README는 AI에 의해 번역되었습니다. 오류를 발견하시면 Pull Request를 열어주세요.

---

## 라이선스

Merkle Pay는 [MIT 라이선스](LICENSE)에 따라 라이선스가 부여됩니다.
