# AI 협업 Core Handoff

```text
Issue:
목적:
현재 상태:
담당 역할:
다음 역할:
Branch:
PR:
최근 Commit:
변경 파일:
완료한 내용:
검증:
발견된 문제:
남은 작업:
위험/주의사항:
다음 AI가 해야 할 일:
```

## 원칙
1. 실제 GitHub/코드/CI 상태를 기준으로 한다.
2. UNKNOWN을 PASS로 바꾸지 않는다.
3. 진행 중인 변경을 덮어쓰지 않는다.
4. DB/Auth/Secret/Production 변경은 별도로 명시한다.
5. 테스트 실패와 known issue를 숨기지 않는다.

## AI-AUDIT Handoff

각 검사 시점마다 아래 기록을 작성한다. PR 단계에서는 미래 Release/DONE을 UNKNOWN(미실행)으로 남기며 승인 전 배포 증거를 요구하지 않는다.

```text
변경 유형/적용 대상:
검사 시점(PR / Release / DONE):
검사 대상 SHA:
PR HEAD SHA:
Merge SHA 및 PR HEAD와의 관계:
배포 source SHA 및 Merge SHA와의 관계(비적용 시 N/A + 사유):
PR 판정(PASS / BLOCKED / UNKNOWN) 및 근거:
Release 판정(PASS / BLOCKED / UNKNOWN) 및 근거:
DONE 판정(PASS / BLOCKED / UNKNOWN) 및 근거:
증거 출처(URL / run / review / commit)와 연결된 SHA:
관련 CI/테스트/문서·정적 검증 결과와 출처 및 대상 SHA(비적용 시 N/A + 사유):
Deployment READY / Production URL / Production Smoke 결과와 출처(비적용 시 N/A + 사유):
Migration 결과/운영 Smoke 결과와 출처:
Framework 동기화 run/consumer Update PR 검증 결과와 출처:
비적용 증거 항목별 N/A 사유:
미해결 차단 지적/필수 증거 공백:
최신 문서/남은 작업 추적:
Issue 종료 준비(가능 / 차단 / 미확인) 및 근거:
후속 조치 담당(AI-LEAD 또는 원인 담당 역할):
```

BLOCKED 사유가 우선이며 필수 증거만 미확인이면 UNKNOWN이다. PASS는 검사 대상 SHA에 연결된 필수 증거가 확인되고 미해결 차단 지적이나 실패·상충이 없을 때만 기록한다. N/A는 개별 비적용 증거에만 사용한다. 감리는 읽기 전용 보고를 인계하며 후속 작업 생성과 Issue 종료는 담당 역할/AI-LEAD가 수행한다.

## CODEX ANALYSIS — 구현 전
다음 항목을 구현 전에 Issue/PR에 기록한다. 작은 문서 변경은 짧게 작성할 수 있다.
- Issue / 목적 / 작업 의도
- 확인한 규칙 경로와 대상 ref, 없는 프로젝트 규칙
- 현재 구조 / 관련 파일 / 주요 호출 경로
- 영향 범위와 위험도 / DB·Auth·권한·CI/CD·Production 영향
- 회귀 위험 / 구현 계획 / 필요한 테스트 / 사용자 승인 지점
- UNKNOWN 항목, 실제 분석 담당 도구

## CODEX HANDOFF — 구현 후 REVIEW/TEST 인계
- Issue / Branch / Commit / PR / 대상 HEAD SHA
- CODEX ANALYSIS 참조 / 변경 파일 / 구현 내용 / 분석 대비 변경점
- 실제 수행 도구 / 실행한 관련 테스트·정적 검증 / 결과·출처·대상 SHA
- REVIEW: 검토 범위, 미해결 지적, 기존 동일 SHA 리뷰 또는 새 리뷰 필요 여부
- TEST: 핵심 사용자 시나리오, 회귀 영역, DB/Auth 영향, 추가로 필요한 검증
- Known issue / UNKNOWN / 남은 작업 / 위험·롤백 / 다음 역할
- 사용자 머지 승인 기록: 승인 내용, 승인 대상 SHA·범위, 자동 배포·동기화 영향

실행하지 않은 분석/테스트를 소급 작성하지 않는다. 마커 문자열만으로 실제 실행이나 PASS를 인정하지 않으며, 구현 담당의 자체 검증을 독립 REVIEW로 승격하지 않는다.
