# AI-REVIEW

PR의 기능 오류, 보안, 회귀, 예외, 성능, 테스트 누락을 독립적으로 검토한다.

결과: BLOCKER / WARNING / NOTE.


기본 담당 도구는 **GitHub Copilot**이며, 구현 담당 AI-CODE(Codex)와 독립된 관점의 검증을 우선한다. 위험도별 리뷰 강도와 동일 SHA 증거 재사용은 Core Workflow 정책을 따른다.

Copilot 한도 초과 시 구현 담당과 다른 GitHub 협업자(write 이상 권한)가 현재 HEAD 커밋의 PR Diff와 직접 영향 파일을 검토하고 GitHub APPROVED 리뷰를 남길 수 있다. 승인 리뷰에는 검토 범위, 발견 사항, 조치 결과를 기록한다. PR 작성자 자신의 승인, 과거 SHA 승인, 한도 초과 알림, 구현 담당 Codex의 자체 검토는 독립 리뷰로 인정하지 않는다. 사람의 최종 머지 승인과 이 독립 리뷰는 별개다.

## Copilot 리뷰 요청 운영 규칙

- GitHub.com에서는 PR 우측 **Reviewers → Copilot → Request**를 사용한다.
- GitHub REST review-request API를 사용할 때 reviewer 식별자는 반드시 `copilot-pull-request-reviewer[bot]`를 사용한다. `copilot-pull-request-reviewer`처럼 `[bot]`을 생략한 계정은 일반 collaborator로 해석되어 422(`Reviews may only be requested from collaborators`)가 발생할 수 있으므로 사용하지 않는다.
- GitHub CLI에서는 공식 별칭 `@copilot`을 사용한다.
- Copilot 요청 성공 여부를 일반 사용자의 `requested_reviewers` 값만으로 판정하지 않는다. 요청 직후 PR 갱신 시각과 이후 Copilot review/comment를 확인한다.
- 동일 HEAD SHA에는 리뷰 요청을 반복 호출하지 않는다. 요청이 성공 처리되면 결과를 기다리고, 실패 응답 또는 명시적 quota 오류가 확인된 경우에만 원인을 조치한 뒤 1회 재요청한다.
- Copilot이 quota limit으로 리뷰하지 못했다는 COMMENTED 기록은 독립 리뷰 완료로 인정하지 않는다.

## 요청 시점과 실제 실행 수
- 위험도에 따라 리뷰가 필요한 최종 HEAD에 기본 1회 요청한다. 관련 구현·검증 실패 수정 후 요청하며 LOW 기본 생략 정책을 유지한다.
- 진행 중인 자동 리뷰에는 수동 요청을 더하지 않는다. 동일 SHA의 완료된 유효 결과를 재사용한다.
- 결함 수정으로 HEAD가 바뀌면 영향 검증 후 필요한 새 HEAD 리뷰를 기본 1회 수행한다.
- 자동 신규 PR 리뷰/매 push 재리뷰는 기본 비활성 운영 정책이다. 관리자 설정 미확인은 UNKNOWN으로 기록한다. 문서만으로 실제 설정 완료나 실행 횟수를 단정하지 않는다.
- 실제 실행 수는 GitHub review/run으로 확인한다. 수동 요청 0회를 전체 리뷰 0회/1회로 바꾸어 보고하지 않는다.
- 실행 실패/quota 기록은 유효 리뷰가 아니다. 원인 조치 전 반복 호출하지 않는다. 대체 리뷰는 위 별도 협업자 기준을 유지한다.
