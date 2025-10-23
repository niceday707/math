# GitHub Pages 배포 가이드

## 🚀 GitHub Pages로 웹사이트 배포하기

### 1단계: GitHub 저장소 생성
1. GitHub에 로그인
2. "New repository" 클릭
3. 저장소 이름 입력 (예: `math-collection`)
4. "Public" 선택 (GitHub Pages 무료 사용을 위해)
5. "Create repository" 클릭

### 2단계: 파일 업로드
1. 생성된 저장소 페이지에서 "uploading an existing file" 클릭
2. 다음 파일들을 드래그하여 업로드:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. 커밋 메시지 입력 (예: "Initial commit")
4. "Commit changes" 클릭

### 3단계: GitHub Pages 활성화
1. 저장소 페이지에서 "Settings" 탭 클릭
2. 왼쪽 메뉴에서 "Pages" 클릭
3. "Source" 섹션에서 "Deploy from a branch" 선택
4. Branch를 "main"으로 선택
5. "Save" 클릭

### 4단계: 웹사이트 확인
1. 몇 분 후 저장소 페이지 상단에 "Environments" 섹션에 GitHub Pages 링크가 표시됩니다
2. 링크를 클릭하여 웹사이트 확인
3. URL 형식: `https://[사용자명].github.io/[저장소명]`

## 🔧 추가 설정

### 커스텀 도메인 설정 (선택사항)
1. Settings > Pages에서 "Custom domain" 입력
2. 도메인 제공업체에서 CNAME 레코드 설정
3. "Enforce HTTPS" 체크

### 자동 배포 설정
- 저장소에 파일을 푸시할 때마다 자동으로 웹사이트가 업데이트됩니다
- 변경사항이 반영되는데 보통 1-5분 정도 소요됩니다

## 📱 모바일 최적화
- 반응형 디자인으로 모바일에서도 완벽하게 작동합니다
- 터치 인터페이스에 최적화되어 있습니다

## 🔍 SEO 최적화
- 메타 태그가 포함되어 검색 엔진 최적화가 되어 있습니다
- 소셜 미디어 공유 시 적절한 미리보기가 표시됩니다

## 🛠️ 문제 해결

### 웹사이트가 표시되지 않는 경우
1. 저장소가 Public인지 확인
2. 파일명이 정확한지 확인 (대소문자 구분)
3. 몇 분 더 기다린 후 다시 시도

### 스타일이 적용되지 않는 경우
1. CSS 파일 경로 확인
2. 브라우저 캐시 삭제 후 새로고침

---

**축하합니다!** 🎉 이제 수학 자료 수집기가 인터넷에서 접근 가능한 웹사이트로 배포되었습니다!
