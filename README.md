# Build Monitor

BuildForge 배포 현황을 조회·모니터링하기 위한 웹앱입니다.

## 개발 단계
- Dashboard UI: 구현
- Dummy Data: 구현
- BuildForge API 연동: 예정
- JSON 기반 데이터 저장: 예정
- 일자별 JSON 로테이션: 예정
- DB: 현재 사용하지 않음

## 목표 구조
BuildForge -> Collector -> 일자별 JSON -> Build Monitor Dashboard

## Branch 전략
- main: 운영/배포 가능한 안정 버전
- develop: 통합 개발 브랜치
- feature/*: 신규 기능 개발
- fix/*: 버그 수정

기능 개발은 develop에서 feature 브랜치를 생성하고 Pull Request로 반영합니다.

## 개발
npm install
npm run dev
npm run build

## 데이터 정책
실제 운영 데이터와 JSON 로그는 Git에 커밋하지 않습니다.
운영 데이터는 Collector가 생성하고 Dashboard가 조회합니다.
