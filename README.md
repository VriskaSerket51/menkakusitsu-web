# menkakusitsu-front

제주과학고 학교생활 서비스의 웹 프론트엔드입니다.

## 로그인 API 코드 생성

Node.js 24.15 이상에서 `npm ci`로 설치합니다. 로그인 요청/응답 타입과 호출 함수는
OpenAPI 문서에서 Orval로 생성합니다. [개발 흐름과 검증 방법](docs/openapi.md)을 참고하세요.

```sh
npm run generate:api -- --source ../menkakusitsu-api/openapi.json
npm run check:api
npm test
npm run build
```

## 개발 방법

1. [VSCode](https://code.visualstudio.com/download), [git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/ko/) 설치
2. Node.js 설치가 끝나면 재부팅
3. VSCode 실행후 F1 -> git clone -> 해당 레포 주소 입력 -> 레포 다운받을 폴더 선택
4. 상단 바 -> 터미널 -> 새 터미널 -> menkakusitsu-front 선택
5. `npm install`을 통해 필요한 패키지 설치
6. `npm run dev`을 통해 개발 서버 실행 가능
> 개발 서버는 수정된 코드를 저장하면 자동으로 리로드 됨
7. 수정 사항은 커밋 후 마스터 브랜치에 푸시
> 사이트 잘 작동하는지 확인 후 푸시할 것

## LICENSE

Calculator Simulator by [Numworks](https://www.numworks.com/simulator/)

API 타입은 전체 OpenAPI 명세에서 생성하며 menkakusitsu-lib는 사용하지 않습니다. 자세한 흐름은 [OpenAPI 문서](docs/openapi.md)를 참고하세요.

## React Router SPA

React Router Framework Mode를 `ssr: false`로 사용합니다. API는 기존 별도 서버를 유지합니다.

- `npm run dev`: 개발 서버와 라우트 타입 자동 생성
- `npm run typecheck`: 라우트 타입 생성 후 전체 타입 검사
- `npm run build`: 정적 SPA 빌드와 기존 URL·청크 분리 검증
- `npm run preview`: 빌드 결과 로컬 확인

배포 디렉터리는 **`dist/client`**입니다. 정적 호스트에서 존재하지 않는 페이지 경로는 `/index.html`로 연결해야 직접 접속과 새로고침이 동작합니다. `/assets/`와 API 경로는 해당 파일·API로 처리하세요.

라우트는 `src/routes.ts`, 문서와 메타 태그는 `src/root.tsx`, 공통 화면과 클라이언트 권한 검사는 `src/routes/app-layout.tsx`에서 관리합니다. 페이지의 `handle.permission`과 `handle.exact`는 화면 진입 조건이며 최종 데이터 권한 검사는 API가 수행합니다. 링크는 React Router의 `href()`와 각 페이지의 `./+types/...` 생성 타입을 사용합니다. `.react-router/`는 자동 생성하므로 커밋하지 않습니다.

## 쿠키 세션 인증

- access token은 웹 메모리에만 보관하며 일반 API에 Bearer로 전달합니다.
- refresh token은 서버가 발급하는 HttpOnly 쿠키입니다. JSON 응답과 웹 저장소에는 넣지 않습니다. Path=/v1/auth, Domain 미설정, SameSite=Lax가 기본이며 운영에서는 Secure가 필수입니다.
- 새로고침하면 쿠키로 access token을 복원한 뒤 화면 권한을 검사합니다. 쿠키가 만료되면 비로그인으로 전환하고, 통신 장애이면 기존 안내 대화상자에서 확인 후 재시도합니다.
- 로그인·갱신·로그아웃에 credentials와 X-CSRF-Protection: 1을 보냅니다. 서버는 WEB_PREFIX에서 얻은 정확한 Origin(스킴·호스트·포트)을 검사합니다. CLI 클라이언트도 이 헤더와 쿠키 저장소가 필요합니다.
- 같은 탭의 갱신은 합치고 Web Locks로 여러 탭의 쿠키 변경을 직렬화합니다. 다른 탭에서 로그인·로그아웃하면 BroadcastChannel로 토큰 없이 변경 사실만 전달하고 페이지를 새로고침합니다. Web Locks를 지원하지 않는 환경의 동시 갱신은 서버에서 하나만 성공하며 재로그인이 필요할 수 있습니다.
- 로그아웃은 access token 만료와 관계없이 쿠키로 현재 기기 세션을 폐기합니다. all: true는 모든 기기를 종료합니다. 서버 실패 때는 성공으로 표시하지 않습니다.

### 배포

웹과 API를 함께 배포하세요. 기존 localStorage의 access-token/refresh-token은 읽지 않고 삭제하므로 기존 사용자는 한 번 다시 로그인해야 합니다. DB 스키마 변경은 없습니다.

WEB_PREFIX는 실제 웹 주소, VITE_API_PREFIX는 API 주소로 설정합니다. 운영에서는 HTTPS를 사용하세요. 개발 시 웹과 API 모두 localhost 또는 모두 127.0.0.1로 호스트를 통일하고 WEB_PREFIX의 포트를 맞추세요. NODE_ENV=development에서는 Secure 기본값이 false입니다.

동일 사이트의 HTTPS 서브도메인 또는 같은 Origin의 /v1 리버스 프록시 구성을 권장합니다. 서로 다른 사이트를 쓰면 AUTH_COOKIE_SAME_SITE=none과 AUTH_COOKIE_SECURE=true가 필요하지만 브라우저의 제3자 쿠키 차단으로 로그인이 제한될 수 있습니다. CORS의 wildcard Origin은 허용하지 않습니다.

HttpOnly는 JavaScript가 refresh token 원문을 읽는 것을 막습니다. XSS 자체나 감염된 페이지에서의 API 호출을 막는 수단은 아니므로 기존 입력·출력 처리도 유지해야 합니다.

## 코드 구조

- **src/routes.ts**: URL과 라우트 모듈의 명시적 연결. generouted는 사용하지 않습니다.
- **src/routes/**: 페이지와 레이아웃. URL의 :board/:postId는 파일 폴더명과 독립적입니다.
- **src/features/**: 기능별 재사용 화면과 상태. auth는 토큰·세션·로그인 화면, bbs는 공용 게시글 목록, chat·meal·specialroom·timetable은 해당 기능 UI를 둡니다.
- **src/components/**: 여러 기능에서 사용하는 공통 UI.
- **src/api/**: 생성 클라이언트·타입·HTTP 전송과 화면용 API 호출(actions.ts). generated는 직접 편집하지 않습니다.
- **src/hooks/**, **src/utils/**: 공통 훅과 저장소·날짜 등의 보조 함수. 필요한 모듈을 직접 import합니다.

페이지에서 다른 라우트 모듈을 재사용하지 않고 공통 화면을 features로 추출합니다. session-boundary는 로그인 복원을 기다리고, app-layout은 공통 화면과 페이지 권한을 관리합니다. 파일은 kebab-case, React 컴포넌트는 PascalCase를 사용합니다.

## 정적 자산

- 브라우저 폰트는 `src/assets/fonts/web/*.woff2`와 `src/styles/fonts.css`를 사용합니다. NotoSansKR은 소스에 있는 문자를 작은 UI 묶음으로, 나머지 원본 문자는 서로 겹치지 않는 unicode-range 묶음으로 제공합니다. 사용자 이름·게시글의 문자를 제거하지 않습니다.
- 재생성: Python 환경에 `fonttools[woff]==4.66.0`을 설치한 뒤 `python scripts/optimize-fonts.py`를 실행합니다. 보존한 원본 폰트에서 변환하고 문자 범위를 검증합니다. 앱 실행·빌드에는 Python이 필요하지 않습니다. 새 문구도 기존 나머지 묶음으로 표시되며, 재생성하면 UI 묶음에 포함됩니다.
- 로고 원본은 `src/assets/branding/`에 보존합니다. 배포용 `public/logo192.png`·`logo512.png`는 각각 192px·512px, `logo.png`는 아바타·푸시용 512px, `icon.png`는 180px입니다. 이미지를 변경할 때는 원본에서 다시 축소합니다.

### 로컬 Firebase

Firebase Analytics와 푸시는 개발 모드와 로컬 주소(localhost, 루프백, 사설 IPv4, .local)에서 기본적으로 비활성화됩니다. 로컬 주소로 접속한 프로덕션 빌드도 동일합니다. 기존 Firebase 서비스 워커는 다음 페이지 로드에서 해제하며, 다른 서비스 워커와 서버에 저장된 푸시 토큰은 변경하지 않습니다.

실제 Firebase 연결을 테스트하려면 .env.local에 `VITE_FIREBASE_ENABLED=true`를 설정하고 개발 서버를 다시 시작하세요. `false`는 배포 환경에서도 초기화를 끕니다. 배포 환경은 별도 설정 없이 활성화됩니다. 빌드 결과의 설정을 바꾸려면 다시 빌드해야 합니다.

### Firebase 로그 검증

- 페이지 조회는 앱이 수동으로 전송합니다. GA 관리 → 데이터 스트림 → 웹 스트림 → 향상된 측정 → 페이지 조회에서 **브라우저 방문 기록 변경 기반 페이지 변경**을 비활성화하세요. 초기 자동 조회는 코드의 send_page_view: false로 차단합니다. 콘솔 설정을 변경하지 않으면 SPA 조회가 중복될 수 있습니다.
- DebugView에서 홈 → 신청 → 현황 → 뒤로 이동 시 page_view가 각각 한 번인지 확인합니다. 쿼리/해시만 바뀌면 새 조회를 보내지 않습니다. 동적 게시판·글 ID와 알 수 없는 경로는 정규화하며 입력 내용, JWT, 푸시 토큰은 보내지 않습니다.
- app_action: action/outcome/failure_kind/duration_ms. 로그인·가입·신청·취소·신청 관리·글/댓글 작성·푸시 서버 등록/삭제 결과를 기록합니다. 보고서에 쓰려면 해당 이벤트 매개변수의 맞춤 정의를 GA에 등록하세요.
- app_push: registered/unregistered/foreground_received/foreground_opened 단계. 백그라운드 수신·클릭 전체를 측정하는 지표가 아닙니다.
- app_firebase_error: stage/failure_kind만 기록합니다. Analytics 자체 초기화 실패 또는 수집 차단은 Analytics로 보고할 수 없으므로 정제된 브라우저 콘솔 경고만 남습니다.
- 로컬 Firebase는 계속 기본 비활성화입니다. 실제 수신 확인은 별도 승인된 테스트 환경에서 DebugView로 진행합니다.

### TypeScript 병행 구성

타입 검사·테스트·빌드의 `tsc`는 `@typescript/native` 별칭으로 설치한 TypeScript 7을 사용합니다. ESLint와 컴파일러 API를 사용하는 도구는 `typescript` 별칭의 공식 `@typescript/typescript6` 호환 패키지를 사용합니다. 따라서 `typescript` 의존성을 단독으로 7로 교체하지 마세요.

`npx tsc --version`으로 검사기 버전을, `npx tsc6 --version`으로 호환 컴파일러 버전을 확인할 수 있습니다. 기존 npm 명령은 그대로 사용합니다.
### FID 푸시 등록

새 웹은 Firebase register/onRegistered/unregister/onUnregistered API를 사용합니다. API를 먼저 배포한 뒤 웹을 배포하세요. 이미 알림을 승인한 기기는 로그인 세션 복원 후 권한이 유지되어 있으면 FID로 자동 갱신합니다. 알림을 끄면 서버의 현재 사용자·기기 등록을 먼저 삭제하고 Firebase 등록을 해제합니다. 이전 웹의 토큰 요청은 API가 계속 허용합니다. 로컬 Firebase 기본 비활성화는 유지됩니다.
