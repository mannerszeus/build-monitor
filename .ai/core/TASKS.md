# AI 협업 Core Task 규칙

- GitHub Issue가 Task의 원본이다.
- 기능 추가, 버그 수정, 구조/보안/운영 개선, 의미 있는 테스트/CI/배포 변경은 Issue를 만든다.
- Issue에는 목적, 범위, 완료조건, 영향범위, 위험/복구 방법을 기록한다.
- PR은 Issue를 참조한다.
- Issue Close는 구현/Review/CI/Merge/배포 검증을 확인한 뒤 수행한다.
- 미확인 상태는 UNKNOWN이다.

표준 상태:
`PLANNED → ANALYZED → IMPLEMENTED → REVIEWED → TESTED → MERGED → DEPLOYED → PRODUCTION_VERIFIED → DONE`
