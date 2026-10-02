# AI 협업 Core Workflow

```text
사용자 요구 → AI-LEAD(ChatGPT) → Issue → 영향도 분석 → Branch → AI-CODE(Codex) / DBA / UX → PR → AI-REVIEW(Copilot 등) → AI-TEST(Playwright/Actions) → Quality Gate → AI-AUDIT(PR 증거) → 사람 승인 → Merge → AI-RELEASE → Deployment READY → Production URL → Production Smoke → AI-AUDIT(Release 증거) → 문서 현행화/Issue 종료 준비 → AI-AUDIT(DONE 확인) → AI-LEAD의 Issue Close/완료 보고
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
| DONE | 문서 현행화 + 핵심 검증 증거/최종 감리 확인 후 AI-LEAD의 Issue 종료·완료 보고 |

## 완료 증거
DONE으로 승격할 때 PR 또는 Handoff에 변경 commit, 관련 테스트 결과, PR/Release/DONE 감리 판정과 필수 증거를 기록한다. 배포/Migration/Smoke/Framework 동기화는 적용 대상의 실제 결과를 기록한다. 비적용 항목은 N/A와 사유를 기록하며, 필수인데 검증하지 않은 항목은 UNKNOWN으로 남긴다.

## 감리 판정
- PR: 머지 승인 전 Issue/PR 연결, 위험도, 현재 HEAD의 독립 리뷰·관련 테스트 및 미해결 차단 사항을 대조한다. 미래 Release의 배포/Smoke는 이 단계의 필수 증거가 아니다.
- Release: PR HEAD와 Merge SHA의 관계, 해당 SHA에 연결된 관련 CI/검증 결과와 출처(비적용 항목은 N/A와 사유) 및 적용 대상의 배포 source SHA/READY/Production URL/Smoke, Migration 또는 Framework 동기화 증거를 대조한다.
- DONE: 문서 현행화 후 Issue 종료·완료 보고 전에 앞선 판정, 남은 작업의 추적 여부, Issue 종료 준비를 대조한다. AI-LEAD는 미해결 차단 지적 또는 필수 증거의 실패·공백이 있으면 Issue를 열어두고 원인 역할의 조치를 기다린다.

각 결과는 PASS/BLOCKED/UNKNOWN으로 기록한다. 미해결 차단 지적 또는 필수 증거의 실패·상충이 있으면 BLOCKED이며, 필수 증거만 미확인인 경우 UNKNOWN이다. PASS는 해당 단계의 필수 증거가 검사 대상 SHA에 연결되고 미해결 차단 지적과 실패·상충이 없는 경우에만 허용한다. 스레드 resolve나 구현자의 자체 검증만으로 독립 리뷰 통과를 대신하지 않는다. N/A는 비적용 증거 항목의 표시이며 감리 판정을 대신하지 않는다. 감리 보고는 기존 Gate나 사람 승인 요구를 완화하지 않는다. 보고 자동화는 먼저 advisory로 운영하고, 기존 Actions의 증거를 재사용한다.

## 변경 유형별 적용

| 변경 유형 | Release 증거 |
|---|---|
| 애플리케이션 릴리스 | Merge→배포 source SHA 연결, READY, Production URL, 실제 Production Smoke |
| DB/Migration | 적용 대상 Migration 결과와 운영 Smoke; 앱 배포가 없으면 배포 항목만 N/A와 사유 |
| 문서-only | Merge 반영과 문서 검증; 앱 배포/Production Smoke는 N/A와 사유 |
| Framework-only | Merge 반영, 관련 정적 검증 결과·출처 및 필요한 Framework 동기화 run/consumer Update PR 검증; 앱 배포/Production Smoke는 N/A와 사유 |

위 도식의 앱 배포/Smoke 단계는 해당 유형에 적용한다. 비적용 상태·증거는 N/A와 사유로 기록하고 적용 대상의 상태만 순차적으로 관리한다. 필요한 동기화나 Migration이 미실행/미확인인 경우 UNKNOWN이며 N/A로 바꾸지 않는다.

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
- AI-AUDIT는 기존 증거를 재사용하며 별도 Full Review 또는 새 CI 러너를 기본 요구하지 않는다.
- 동일 SHA에 대한 검증 증거가 유효하면 재사용하고, 변경된 SHA만 필요한 검증을 다시 수행한다.
- Vercel Preview는 명시적으로 필요한 경우에만 생성하며 Production 배포와 Smoke는 Release 단계에서만 수행한다.
