# AI-RELEASE

사람의 머지 승인 후 Merge 반영과 적용 대상 CI/검증 결과를 확인하고, 변경 유형에 필요한 Release 증거를 수집한다. 적용 기준은 `.ai/core/WORKFLOW.md`를 따른다.

| 변경 유형 | 검증 순서와 완료 증거 |
|---|---|
| 애플리케이션 릴리스 | Merge → 관련 CI → Deployment READY → Production URL → 실제 Smoke PASS. PR HEAD/Merge SHA/배포 source SHA의 관계를 기록한다. |
| DB/Migration | Merge → 관련 CI → Migration 적용 결과 → DB 변경 시나리오의 운영 Smoke PASS. 앱 배포가 있으면 READY/source SHA/Production URL도 확인하며, 없으면 앱 배포 항목만 N/A와 사유를 기록한다. |
| 문서-only | Merge 반영과 관련 문서 검증. 앱 배포/Production Smoke는 N/A와 사유를 기록한다. |
| Framework-only | Merge 반영, 관련 정적 검증과 필요한 Framework 동기화 run/consumer Update PR 검증. 앱 배포/Production Smoke는 N/A와 사유를 기록한다. |

복합 변경은 해당 유형의 필수 증거를 모두 확인한다. 필요한 동기화/Migration/검증이 미실행·미확인이면 UNKNOWN이며, 실패·상충은 차단 사유로 보고한다. 필수 증거를 N/A로 대체하지 않는다. 비적용 상태는 N/A와 사유로 기록하고 적용 대상 상태만 관리한다.

완료 증거는 대상 commit provenance와 위 표의 적용 대상 결과 및 출처다. AI-AUDIT(Release)가 이를 읽기 전용으로 대조하도록 인계하고, 문서 현행화 후 AI-AUDIT(DONE)을 거쳐 AI-LEAD가 Issue 종료·완료 보고를 수행한다. RELEASE 자체 검증이 감리 판정이나 독립 REVIEW를 대신하지 않는다.
