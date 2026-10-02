# Build Monitor

BuildForge 실행 상태를 JSON 스냅샷으로 조회하는 모니터입니다. 현재는 **JSON 화면 연동 완료, 실제 BuildForge 수집 미연결** 단계입니다. 빌드포지 로그인·HTML 파싱·ITSM 상태 연동을 실제로 검증한 것으로 보고하지 않습니다.

## 실행

Node.js 20.9 이상에서 `npm ci`, `npm test`, `npm run build`, `npm start`를 실행하고 `/`에 접속합니다. `index.html`을 파일로 열어도 JSON 가져오기와 예제 확인을 사용할 수 있습니다. standalone HTML은 `public/dashboard.html`에서 `npm run check:standalone`으로 생성하며, 직접 중복 수정하지 않습니다.

- 최초 화면은 데이터 없음입니다. 예제 보기 버튼의 데이터는 항상 **예제**로 표시됩니다.
- JSON 파일 열기는 브라우저 메모리에서만 읽습니다. 업로드·외부 저장·localStorage 저장은 하지 않습니다. 페이지를 새로고침하면 사라집니다.
- 최근 배포 20개, 진행 중, 시스템/환경별 최신 실행, 상태별 통계, 로그 검색과 상세 조회를 제공합니다. 모든 메뉴의 환경/상태/검색 필터와 통계는 같은 스냅샷을 사용합니다.
- 성공률은 성공 / (성공 + 실패 + 취소)이며 진행 중과 미확인을 제외합니다. 현재 스냅샷에 포함된 실행의 집계이며 전체 운영 이력 통계가 아닙니다.
- 소스에 없는 상태·환경은 미확인으로 남기고 로그/세부 단계 결과를 생성하지 않습니다. 소요 시간은 수집된 durationSeconds 또는 시작·종료 시간으로만 계산합니다.

## 사내 자동 연결

인증/접근제어가 적용된 **사내 웹서버**의 동일 origin `/snapshot.json`에 수집기 출력을 놓고 화면에서 사내 스냅샷 연결을 누릅니다. 30초마다 GET하고 10초 timeout을 사용합니다. 인증 리다이렉트, HTML 로그인 페이지, 잘못된 JSON, 5MB 초과 응답은 오류로 처리합니다. 120초 이상 지난 수집 시간은 지연으로 표시합니다. 오류 때 이전 데이터는 유지하되 조회 실패가 보입니다. 파일이나 예제를 열면 자동 조회를 중지합니다.

Vercel 공개 데모에는 실제 사내 스냅샷·credentials·Cookie를 올리지 마세요. 실제 데이터 연결은 별도 접근제어가 적용된 사내 환경에서만 구성합니다. 이 저장소에는 수집기나 인증 프록시가 아직 없습니다. public/snapshot.json은 기본 제공하지 않으며 gitignore로 제외됩니다. 사내 웹서버가 스냅샷을 부분 기록하지 않도록 임시 파일 저장 후 rename으로 교체해야 합니다.

## JSON 계약 v1

예제는 `examples/snapshot.json`에 있습니다. 최상위 필수 값은 `schemaVersion: 1`, `generatedAt`(시간대 포함 ISO timestamp), `deployments` 배열입니다. 최대 5,000개 실행과 전체 5MB를 허용하며 ID 중복은 거부합니다.

| 필드 | 의미 |
|---|---|
| id | 고유 실행 번호, 필수 |
| system | 시스템 이름, 필수 |
| project / executor | 프로젝트·실행자, 미수집 시 생략 |
| environment | 개발 / 테스트 / 운영, 그 외 미확인 |
| status | RUNNING / SUCCESS / FAILED / CANCELLED / UNKNOWN, 그 외 UNKNOWN |
| startedAt / finishedAt | 시간대 포함 ISO timestamp, 미수집 시 생략 |
| durationSeconds | 수집한 소요 초, 미수집 시 생략 |
| stage | 수집한 현재 단계, 미수집 시 생략 |
| logs | 실제 제공된 로그 문자열 배열, 최대 1,000줄/줄당 10,000자 |

source는 출처 표시용 문자열입니다. `source: "demo"`는 예제 모드로 표시합니다. JSON의 알 수 없는 필드는 사용하지 않습니다. 표시되는 모든 데이터는 textContent로 렌더링합니다.

## 실제 BuildForge 연결에 남은 입력

민감정보를 제거한 **로그인 후 작업목록 HTML 한 건**과 아래 메타데이터를 한 번에 확인하면 수집기를 구현할 수 있습니다. 비밀번호·Cookie·Authorization·CSRF token의 실제 값은 보내지 않습니다.

1. 작업목록 테이블 헤더와 대표 행(성공/실패/진행 중), 실행 상세·로그의 링크 경로. 서버명/사용자/프로젝트는 가명으로 바꾸되 태그와 열 순서는 보존합니다.
2. 로그인 POST의 Content-Type과 필드 이름, jobs GET의 상대 경로. 현재 확인된 HTTPS/Servlet/Set-Cookie에 더해 필드 이름과 성공 판별 요소가 필요합니다.
3. 결과 상태가 BuildForge 실행 결과인지 ITSM 배포 결과인지 구분합니다. BuildForge 성공을 ITSM 성공으로 추정하지 않습니다.
4. 로그인 폼이 숨은 nonce/CSRF 값을 요구하는지와 세션 만료 때의 응답 패턴을 확인합니다.

계획 흐름: 사내 수집 프로세스 1개 → 로그인 1회 → Cookie jar 재사용 → jobs/필요 상세 GET → 실제 HTML 구조에 맞춘 파싱 → JSON 임시 저장/원자 교체 → 사내 웹서버 → 이 대시보드. 세션 만료가 확인된 경우에만 제한적으로 재로그인하며 브라우저 사용자 수만큼 로그인하지 않습니다. API를 조회마다 로그인시키는 기존 라이선스 문제를 피하는 구조이나, 실제 세션/라이선스 동작은 사내에서 검증해야 합니다.

## 검증과 릴리스

`npm test`: 형식·시간·크기·ID 중복, 미확인 상태, 필터·통계·소요·빈 스냅샷 회귀 검증. 브라우저에서 JSON 가져오기, 5개 메뉴, 잘못된 JSON/HTML 주입, 조회 실패·이전 데이터 유지, 모바일 화면을 확인합니다. BuildForge 실서버/ITSM/Production은 별도 검증 대상입니다.

자동 브라우저 검증: `npx playwright install chromium` 후 `npm run build`, `npm run test:browser`를 실행합니다. 테스트가 Production 서버를 127.0.0.1:3101에 시작하고 종료합니다. 기존 서버를 검사하려면 BUILD_MONITOR_TEST_URL을 지정합니다. 관리형 환경의 별도 Chromium은 BUILD_MONITOR_CHROMIUM_PATH로 지정할 수 있습니다.

Issue → 한 수정 PR → 관련 검증 → 최종 Copilot 리뷰 1회 → PR 감리 → 사용자 머지 승인 → Merge → Vercel 실제 READY/source SHA/운영 Smoke → Release/DONE 감리 순서입니다. 이전 버전의 Vercel 차단이 실제로 해제됐는지는 새 Preview 배포 결과로 확인합니다.
