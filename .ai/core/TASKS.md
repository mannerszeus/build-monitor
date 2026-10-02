# AI 협업 Core Task 규칙

- GitHub Issue가 Task의 원본이다.
- 기능 추가, 버그 수정, 구조/보안/운영 개선, 의미 있는 테스트/CI/배포 변경은 Issue를 만든다.
- Issue에는 목적, 범위, 완료조건, 영향범위, 위험/복구 방법을 기록한다.
- PR/Commit은 `Related #N`으로 Issue를 참조한다. 최종 감리 전 자동 종료를 방지하기 위해 자동 종료 키워드는 사용하지 않는다.
- Issue Close는 구현/독립 Review/관련 테스트/AI-AUDIT(PR) PASS/사람의 머지 승인/Merge/변경 유형별 Release 검증과 AI-AUDIT(Release) PASS, 문서 현행화, AI-AUDIT(DONE) PASS를 확인한 뒤 AI-LEAD가 수행한다.
- 미해결 차단 지적 또는 필수 증거 실패·공백이 있으면 Issue를 열어둔다. 비적용 배포/Smoke는 N/A와 사유를 기록하며 적용 기준은 `.ai/core/WORKFLOW.md`와 `.ai/roles/RELEASE.md`를 따른다.
- 미확인 상태는 UNKNOWN이다.

표준 상태:
`PLANNED → ANALYZED → IMPLEMENTED → REVIEWED → TESTED → MERGED → DEPLOYED → PRODUCTION_VERIFIED → DONE`
