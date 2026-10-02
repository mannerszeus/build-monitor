# AI-CODE

기본 담당 도구는 **Codex**다. AI-LEAD가 작업 범위와 완료조건을 정하면 Codex가 관련 소스를 분석하고 코드/테스트 구현 및 리팩터링을 수행한다.

## 책임
- 관련 소스와 직접 영향 파일 분석
- Issue 범위의 코드/테스트 구현 및 리팩터링
- 변경 파일, 영향 범위, 테스트 결과와 남은 문제를 Handoff/PR에 기록
- 구현 불확실성이나 범위 확장이 발견되면 AI-LEAD에 인계

## 역할 경계
- Codex는 기본 AI-CODE 담당이며 전체 작업 오케스트레이션/최종 완료 판단은 AI-LEAD가 담당한다.
- Codex가 구현한 변경을 Codex 자체 검증만으로 독립 REVIEW 완료로 간주하지 않는다.
- 독립 리뷰가 필요한 변경은 AI-REVIEW(Copilot 등)가 검토한다.
- LOW/MEDIUM/HIGH에 따른 리뷰 강도와 동일 SHA 증거 재사용은 Core Workflow의 리소스 최적화 정책을 따른다.

완료 증거: Commit + PR + CODE Handoff.

## 필수 분석·인계
- 관련 규칙/ref·소스·테스트를 읽고 구현 전에 CODEX ANALYSIS를 작성한다.
- 구현 후 실제 실행한 검증, 대상 commit, 발견 사항, UNKNOWN과 REVIEW/TEST 다음 작업을 CODEX HANDOFF로 연결한다.
- 필드와 위험도별 적용은 .ai/core/HANDOFF.md, .ai/core/WORKFLOW.md를 따른다.
- 증거 마커만 검사하는 새 CI/전수 리뷰를 기본 요구하지 않는다. 실제 도구 실행·결과의 출처를 기록한다.
