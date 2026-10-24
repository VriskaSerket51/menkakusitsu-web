# menkakusitsu-web

제주과학고 학교생활 서비스의 웹 프론트엔드입니다.

## 개발 방법

1. Node.js 24.15 이상, git 설치
2. 레포 클론 후 해당 폴더에서 터미널 실행
3. `.env.example`을 `.env.local`로 복사 후 웹·API 주소 입력
4. `npm ci`로 패키지 설치
5. `npm run dev`로 개발 서버 실행

> 개발 서버는 http://localhost:3000 에서 실행됨
> 수정한 코드를 저장하면 자동으로 리로드 됨
> API도 별도로 실행해야 함. API의 `WEB_PREFIX`는 웹 주소와 포트까지 맞출 것
> 주소에 `localhost`와 `127.0.0.1` 섞어 쓰지 말 것

## 빌드

```sh
npm run build
npm run preview
```

배포 폴더는 `dist/client`.
페이지 요청은 `/index.html`로 연결해야 새로고침 시에도 열림. `/assets/`와 API 요청은 제외.

주소 설정 변경 시 다시 빌드할 것. 운영은 HTTPS 사용.
API는 같은 사이트의 서브도메인이나 `/v1` 프록시로 연결.

## API 타입 갱신

API에서 `npm run generate:openapi` 실행 후 웹에서 실행.

```sh
npm run generate:api -- --source ../menkakusitsu-api/openapi.json
npm run check:api
```

> `contracts/openapi.json`, `src/api/generated/`는 직접 수정하지 말 것
> API 변경 후 타입 검사·테스트·빌드 확인. `npm run test:api-integration`은 API 빌드 후 실행 가능

## Firebase

개발 모드와 로컬 주소에서는 기본 비활성화.
테스트할 때는 `VITE_FIREBASE_ENABLED=true`, 운영에서도 끄려면 `false`로 설정.

GA 웹 스트림의 향상된 측정에서 '브라우저 방문 기록 변경 기반 페이지 변경'을 끌 것. 앱에서 페이지 조회를 보내므로 켜 두면 중복 집계됨.
푸시 등록 API가 바뀐 버전은 API 먼저 배포 후 웹 배포.

## LICENSE

Calculator Simulator by [Numworks](https://www.numworks.com/simulator/)
