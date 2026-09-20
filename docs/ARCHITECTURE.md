# Architecture

## 목표
BuildForge의 배포 실행 정보를 Collector가 수집하고 일자별 JSON으로 저장한 뒤 Build Monitor가 조회합니다.

## Logical Flow
BuildForge -> API -> Collector(Java) -> /data/build-monitor/deployments/YYYY-MM-DD.json -> Build Monitor(Next.js)

## Data Lifecycle
- Collector가 BuildForge API를 주기적으로 조회합니다.
- 당일 YYYY-MM-DD.json을 갱신합니다.
- 날짜가 바뀌면 새로운 JSON 파일을 생성합니다.
- 오래된 파일은 보관 정책에 따라 삭제할 수 있습니다.
- JSON 저장은 임시 파일 작성 후 rename하는 atomic write 방식을 권장합니다.

## Repository Rules
main은 안정 버전, develop은 통합 개발용으로 사용합니다.
실제 운영 데이터는 저장소에 포함하지 않습니다.
