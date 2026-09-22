# AI 협업 Core 규칙

> 중앙 협업 규칙이다. 프로젝트별 예외는 `.ai/project/PROJECT_RULES.md`에 기록한다.

## 기본 원칙
- GitHub를 Source of Truth로 사용한다.
- 사용자는 자연어로 요구사항을 전달하고 AI-LEAD가 Issue/작업 흐름을 조율한다.
- Issue 번호를 Task ID로 사용한다.
- 구현과 리뷰는 가능하면 분리한다.
- 기본 도구 매핑은 `ChatGPT=AI-LEAD`, `Codex=AI-CODE`, `GitHub Copilot=AI-REVIEW`, `Playwright/GitHub Actions=AI-TEST`로 한다. 도구 장애/권한 제약 시 AI-LEAD가 대체 수단을 지정하되 역할 경계와 검증 증거는 유지한다.
- Codex가 구현한 변경은 Codex 자체 검증만으로 REVIEWED 상태로 승격하지 않는다. 위험도 정책에 따라 독립 리뷰 증거를 사용한다.
- 확인하지 못한 상태는 PASS가 아니라 UNKNOWN이다.
- Production 변경은 개발 → 리뷰 → 테스트 → Release 검증 후 수행한다.
- 중앙 Core 규칙은 자동 동기화 대상이며 프로젝트 고유 규칙은 자동 덮어쓰지 않는다.

## 표준 역할
| 역할 | 책임 | 완료 증거 |
|---|---|---|
| AI-LEAD | 요구사항/범위/순서/통합 | Issue + 완료조건 |
| AI-CODE | Codex 중심 소스 분석/코드·테스트 구현/리팩터링 | Commit + PR + CODE Handoff |
| AI-DBA | Schema/Migration/RLS/Index/데이터 영향 | Migration + DB 검증 |
| AI-UX | UI/반응형/접근성 | 화면 검증 + E2E |
| AI-REVIEW | 버그/보안/회귀/성능 | Review 결과 |
| AI-TEST | E2E/CI/Smoke | 실제 PASS |
| AI-RELEASE | Merge/Deployment/Production | READY + Smoke |

## 상태 Gate
`PLANNED → ANALYZED → IMPLEMENTED → REVIEWED → TESTED → MERGED → DEPLOYED → PRODUCTION_VERIFIED → DONE`

미확인 단계는 UNKNOWN으로 유지한다.

## 위험 작업
DB Schema/RLS/Auth/Migration, 대량 데이터, Production 설정, Secret/환경변수, CI/CD, Breaking Change는 HIGH로 취급한다.

## 사용자 요청 의도
- 검토/확인/분석만 요청: 조사 후 보고하고 변경하지 않는다.
- 수정/반영/배포 요청: 영향 분석 후 필요한 변경과 검증을 수행한다.
- 조건부 요청: 확인 → 필요성 판단 → 필요한 경우 변경한다.

## 보안
- Secret, password, token, service-role key를 Git에 커밋하지 않는다.
- 민감정보를 로그/스크린샷/문서에 남기지 않는다.
- 테스트와 Production Secret을 분리한다.

## 자동 동기화
- 이 Core는 Framework Version을 기준으로 소비 프로젝트에 배포된다.
- 소비 프로젝트의 프로젝트 고유 규칙은 동기화 대상이 아니다.
- Framework 변경은 자동 Update PR로 제안하고 사람의 Merge 승인을 거친다.
