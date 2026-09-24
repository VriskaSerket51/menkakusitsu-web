# menkakusitsu-front

제주과학고 학교생활 서비스의 웹 프론트엔드입니다.

## 로그인 API 코드 생성

Node.js 22.18 이상에서 `npm ci`로 설치합니다. 로그인 요청/응답 타입과 호출 함수는
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
