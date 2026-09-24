# OpenAPI 클라이언트와 타입

전체 API의 OpenAPI 문서에서 타입과 호출 함수를 생성합니다. menkakusitsu-lib 의존성은 제거했습니다.
기존 REST URL과 응답 형식은 유지하며, 화면과 기존 API 래퍼의 타입은 생성 타입에서 추출합니다.

## 개발 흐름

1. API의 기능별 엔드포인트와 Zod 스키마를 수정합니다.
2. API에서 `npm run generate:openapi`를 실행합니다. 서버/DB/Firebase 실행은 필요 없습니다.
3. 웹에서 문서를 가져오면서 재생성합니다.

```sh
npm run generate:api -- --source ../menkakusitsu-api/openapi.json
```

4. 생성 변경을 검토하고 타입 검사/테스트/빌드합니다.

```sh
npm run check:api
npm test
npm run build
```

두 레포가 나란히 있지 않다면 `--source`에 API 문서의 로컬 경로를 지정합니다.
CI에서는 특정 API 커밋의 문서를 받아 사용하세요. 운영 서버의 최신 문서를 빌드마다 가져오지 않습니다.

API가 없어도 체크인된 `contracts/openapi.json`으로 `npm run generate:api`를 실행할 수 있습니다.
`check:api`는 같은 문서로 재생성한 코드가 달라지면 실패합니다. API에서 아직 가져오지 않은
스키마 변경까지 감지하는 것은 아니므로, API 변경 시 문서 동기화를 함께 수행해야 합니다.

## 파일 역할

- `contracts/openapi.json`: API에서 가져온 문서. 직접 수정하지 않습니다.
- `orval.config.mjs`: Orval 생성 설정. 버전은 package.json/lockfile에 고정합니다.
- `src/api/generated/`: 전체 요청/응답 타입과 호출 함수. 직접 수정하지 않습니다.
- `src/api/types.ts`: 생성 타입에서 화면용 이름과 기존 래퍼용 응답 타입을 추출합니다. 필드 구조를 별도로 정의하지 않습니다.
- `src/auth.ts`: JWT 표시용 데이터와 권한 상수·비교 함수. 서버의 인증 검증을 대체하지 않습니다.
- `src/api/http.ts`: Axios 전송, API 주소, 제한 시간. 실패는 호출자에게 reject됩니다.
- `LoginPanel.tsx`: 생성된 응답의 `status === 0`을 확인한 뒤에만 토큰을 사용합니다.

로그인은 공개 엔드포인트이므로 저장된 토큰이나 refresh를 요구하지 않습니다. 현재 생성 호출 함수는 로그인에 사용하고 나머지 화면 호출은 기존 utils/api.ts의 토큰 갱신·주입 경로를 유지합니다.
다른 생성 함수를 화면에 직접 연결할 때는 인증 전송 계층을 연결해야 합니다.
생성된 TypeScript 타입은 실제 응답에 대한 런타임 검증을 수행하지 않습니다.

## 검증

`npm test`는 생성 타입의 잘못된 사용을 거부하는 타입 검사와 요청/오류 처리 단위 테스트입니다.
API를 먼저 빌드한 뒤 아래 명령으로 실제 API 라우터까지 연결할 수 있습니다.

```sh
npm run test:api-integration
```

기본 API 경로는 `../menkakusitsu-api`이며 `API_PROJECT_DIR` 환경 변수로 변경할 수 있습니다.
메모리 DB 대역과 로컬 HTTP 서버만 사용하고 운영 DB/Firebase에는 접속하지 않습니다.
도구 실행에는 Node.js 24.15 이상이 필요합니다.

## JWT 계약 동기화

JWT 필드는 API의 src/contracts/auth.ts에 정의한 TokenClaimsSchema가 원본입니다. API는 Zod에서 타입을 추론하고, 웹은 OpenAPI로 생성한 TokenClaims를 사용합니다. PermissionValues에는 권한별 숫자 리터럴이 포함되며 웹의 권한 상수도 생성 타입으로 검사합니다.

변경 순서: API에서 npm run generate:openapi → 웹에서 npm run generate:api -- --source ../menkakusitsu-api/openapi.json → 양쪽 테스트·타입 검사. 생성 파일은 직접 수정하지 않습니다. 웹의 디코딩은 UI 표시용이며, 서명 검증과 최종 권한 검사는 API가 수행합니다.
