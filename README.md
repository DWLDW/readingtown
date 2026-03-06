# readingtown

학원에서 사용할 수 있는 **출석체크 + 학생평가 웹사이트** 개발 베이스입니다.

## 핵심 기능

- 로그인 기능 + 권한 분리
  - 관리자: 마스터 설정
  - 교사: 반 관리, 학생 관리, 출석/채점
  - 학생: 본인 성적 조회
- 학생 관리
  - 이름/성별/나이/학교/수업레벨/메모 등록
  - 학생 로그인 계정 생성
- 반 관리
  - 반 생성 시 기존 학생 목록 검색 후 선택
  - 학생 이름 클릭 시 상세 정보 확인
- 출석/채점
  - 시간표 기반 수업 선택
  - 학생별 출석(출석/지각/결석) 및 다중 점수 입력
- 마스터 설정
  - 평가 항목 관리
  - 확장 메뉴(모듈) 추가

## 데모 계정

- 관리자: `admin / admin123`
- 교사: `teacher1 / teacher123`
- 학생: `student1 / student123`

## 구조

- `js/modules/moduleRegistry.js`: 모듈 등록/조회 레지스트리
- `js/modules/scheduleModule.js`: 반 관리 모듈
- `js/modules/studentMgmtModule.js`: 학생 관리 모듈
- `js/modules/classroomModule.js`: 출석/채점 모듈
- `js/modules/studentPortalModule.js`: 학생 성적 조회 모듈
- `js/modules/masterModule.js`: 평가항목/확장메뉴 관리 모듈
- `js/store.js`: 로컬스토리지 기반 상태/인증 저장

## 실행

정적 파일입니다.

```bash
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속.

## GitHub 반영 체크(동기화)

로컬에서는 최신인데 GitHub `main`이 예전 버전으로 보일 때는 아래 순서로 확인하세요.

```bash
git remote -v
git fetch origin
git checkout main
git merge work
git push origin main
```

> 브랜치명이 `work`가 아니라면 실제 작업 브랜치명으로 바꿔 사용하세요.
