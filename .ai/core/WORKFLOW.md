# AI 협업 Core Workflow

```text
사용자 요구 → AI-LEAD(ChatGPT) → Issue → 영향도 분석 → Branch → AI-CODE(Codex) / DBA / UX → PR → AI-REVIEW(Copilot 등) → AI-TEST(Playwright/Actions) → Quality Gate → 사람 승인 → Merge → AI-RELEASE → Deployment READY → Production Smoke → 문서/Issue 정리
```

## 상태 승격 기준
| 상태 | 기준 |
|---|---|
| PLANNED | 범위/완료조건 정의 |
| ANALYZED | 코드/DB/CI/배포 영향 조사 |
| IMPLEMENTED | 구현 완료 |
| REVIEWED | Blocker 없음 |
| TESTED | 관련 테스트 PASS |
| MERGED | main 반영 |
| DEPLOYED | 대상 commit 배포 READY |
| PRODUCTION_VERIFIED | Production Smoke PASS |
| DONE | 문서/Issue 정리 + 핵심 검증 증거 기록 |

## 완료 증거
DONE으로 승격할 때 PR 또는 Handoff에 핵심 검증 결과를 기록한다: 변경 commit, 테스트 결과, 배포 상태, Production Smoke 결과(해당되는 경우). 검증하지 않은 항목은 PASS로 표시하지 않고 UNKNOWN으로 남긴다.

## HIGH 변경
DB/Auth/RLS/Migration/Production 설정은 DBA 및 Release 검증을 포함한다.

## 실패 처리
Build/E2E/Review/Deployment/Smoke 실패 시 원인 단계로 되돌린다. 검증 범위를 줄여 PASS로 만들지 않는다.


## 리소스 최적화 원칙
- LOW: 관련 Build/Test만 수행하고 AI Review와 Preview 배포는 기본 생략한다.
- MEDIUM: 관련 테스트와 독립 AI Review 1개를 기본으로 하며 동일 Diff에 대한 중복 AI Full Review를 피한다.
- HIGH: 보안/Auth/DB/CI-CD/Production 영향은 독립 AI 검증을 수행하되 기본은 변경 Diff + 직접 영향 파일만 검토한다. Full Repository Review는 영향 범위가 저장소 전반으로 확산되거나 Diff 검토만으로 안전성을 판단하기 어려울 때만 수행한다.
- Codex는 기본 AI-CODE 담당으로 소스 분석/구현/리팩터링을 수행한다. Codex가 구현한 변경의 독립 리뷰가 필요하면 Copilot 등 AI-REVIEW 증거를 사용한다.
- Codex 기반 추가 검증이 필요한 경우 동일 SHA당 1회를 기본으로 하며, 단순 문서/Framework metadata/소규모 배포 스크립트 변경은 정적 검증·관련 테스트·배포 증거로 충분하면 Full Repository Review를 요구하지 않는다.
- AI 검증 강도는 LOW=기본 생략, MEDIUM=필요 시 Diff Review 1회, HIGH=Diff/영향범위 Review 1회를 기본으로 하고 명확한 사유가 있을 때만 Full Review로 승격한다.
- 문서 및 Framework-only 변경은 애플리케이션 E2E, Vercel Preview, Production 배포를 기본 실행하지 않는다.
- 상태 조회는 read-only로 수행하며 조회를 위해 Workflow, AI Review, Deployment를 재실행하지 않는다.
- 동일 SHA에 대한 검증 증거가 유효하면 재사용하고, 변경된 SHA만 필요한 검증을 다시 수행한다.
- Vercel Preview는 명시적으로 필요한 경우에만 생성하며 Production 배포와 Smoke는 Release 단계에서만 수행한다.
