# readingtown

학원에서 사용할 수 있는 **출석체크 + 학생평가 웹사이트** 예시 구현입니다.

## 핵심 기능

- 시간표(요일/시간/교사/반/학생명단) 등록
- 현재 시간대 수업 자동 필터링
- 학생별 출석 상태(출석/지각/결석) 입력
- 수업 내 다중 점수 항목 입력
- 평가 항목(점수명, 만점) 마스터 관리
- 메뉴를 모듈 단위로 추가 가능한 구조(확장 메뉴 생성)

## 구조

- `js/modules/moduleRegistry.js`: 모듈 등록/조회 레지스트리
- `js/modules/scheduleModule.js`: 시간표 관리 모듈
- `js/modules/classroomModule.js`: 출석/채점 모듈
- `js/modules/masterModule.js`: 평가항목/확장메뉴 관리 모듈
- `js/store.js`: 로컬스토리지 기반 상태 저장

## 실행

정적 파일이므로 브라우저에서 `index.html`을 열면 동작합니다.
