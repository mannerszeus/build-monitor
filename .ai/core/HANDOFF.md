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
