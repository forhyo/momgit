# 몸짓 마을 · Momjit Village

카메라 앞에서 손을 뻗고, 휘두르고, 잠깐 멈추며 노는 아이 몸놀이터.
점프 없이 상체와 팔만 써서 1분 동안 노는 6가지 미니게임, 1P/2P, 칭찬 스티커 앨범을 한 페이지에 담았습니다.

- **컨셉**: 노란 종이와 굵은 잉크선의 플랫 벡터 마을
- **기술**: Vite + TypeScript + Canvas 2D + MediaPipe PoseLandmarker(브라우저 내 실행)
- **서버 없음**: 점수·스티커·프로필은 `localStorage`에만 저장
- **카메라 없이도**: 데모 모드로 마우스/터치 플레이 가능

## 놀이

| 놀이 | 조작 | 한마디 |
| --- | --- | --- |
| 🎈 풍선 가게 | 손 대기 | 올라오는 풍선을 손으로 콕 |
| 🧊 얼음 공장 | 손 휘두르기 | 얼음 블록을 5번 두드려 깨기 |
| ⭐ 별 관측소 | 손 멈추기 | 별 위에 0.35초 머물기 |
| 🐹 두더지 밭 | 손 대기 | 잠깐 나온 두더지를 콕 |
| 🧺 과일 과수원 | 손 좌우로 | 바구니를 움직여 과일 받기 |
| 🥁 축제 북 | 박자 펀치 | 음표가 판정선에 닿을 때 휘두르기 |

- 한 판 30·60·90초(기본 60초), 점프 동작 없음
- 1명 또는 2명 대결(화면 좌우 분할)
- 판이 끝나면 스티커 1개, 12개를 모으면 마을 축제
- 프로필 최대 4명, 이름과 얼굴 저장
- 놀이 시작 시 지원 브라우저에서 전체화면, 결과 화면까지 유지
- 놀이 고르기 화면에서는 `Caketown 1`, 놀이 중에는 `Riverside Ride` 배경 음악
- 게임 음악은 결과 화면까지 이어지고, 허브로 돌아오면 고르기 음악으로 전환
- 설정에서 효과음·배경 음악을 따로 켜고 끄며 음악 볼륨을 조절
- 탭/앱을 벗어나거나 웹페이지를 닫으면 배경 음악이 멈춤

## 실행

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # 타입 검사 + 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

카메라는 `https://` 또는 `localhost`에서만 동작합니다. 처음 카메라를 켤 때 MediaPipe 모델과 WASM(약 20MB)을 내려받습니다.

### 바로 확인하는 주소

- `/?demo=1` — 카메라 없이 허브부터
- `/?game=balloon&start=1` — 특정 놀이를 바로 데모로 시작
- `/?game=drum` — 놀이 소개 모달 열기

## 배포

### GitHub Pages

`.github/workflows/pages.yml`이 포함되어 있습니다.

1. 저장소에 push
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. `main` 브랜치에 push하면 자동 빌드·배포

워크플로가 저장소 이름을 보고 `VITE_BASE`를 자동으로 정합니다.

- 프로젝트 페이지: `/<repo>/`
- 사용자 페이지(`<user>.github.io`): `/`

커스텀 도메인을 붙이면 사이트가 도메인 루트(`/`)로 서빙됩니다. 이때는 저장소의 **Settings → Secrets and variables → Actions → Variables**에서 `VITE_BASE` 변수를 `/`로 추가하세요. 워크플로가 이 값을 우선 사용합니다.

### Vercel

`vercel.json`이 포함되어 있습니다. 저장소를 Vercel에 연결하거나:

```bash
npx vercel --prod
```

프레임워크는 Vite, 빌드 결과는 `dist/`입니다. 루트(`/`) 배포 기준입니다.

### 개인 서버

```bash
npm ci
npm run build
# dist/ 내용을 웹 루트로 복사
```

하위 경로에 올린다면:

```bash
VITE_BASE=/momjit/ npm run build
```

PowerShell에서는:

```powershell
$env:VITE_BASE="/momjit/"; npm run build
```

`vite preview`로 하위 경로를 확인할 때도 같은 `VITE_BASE`가 필요합니다. 빌드와 미리보기의 기준 경로가 다르면 에셋이 404가 납니다.

- 반드시 HTTPS로 서빙하세요(카메라 권한).
- `.wasm`은 `application/wasm`으로 서빙하는 편이 좋습니다.
- `dist/`의 `models/`, `wasm/`은 약 42MB입니다. 서버 용량과 첫 로딩 속도를 확인하세요.

### OG 이미지·도메인

`public/og.png`(1200×630)가 포함되어 있습니다. 배포 도메인이 정해지면 `index.html`의 `og:image`, `twitter:image`를 절대 URL로 바꾸는 것을 권장합니다.

## 프로젝트 구조

```text
index.html / help.html / privacy.html   허브 · 도움말 · 개인정보
src/
  main.ts                진입점, 서비스 워커 등록
  style.css              디자인 시스템 전체
  brand.ts               마스코트·카드 아트·아바타·스티커 SVG
  store.ts               프로필·설정·기록·스티커(localStorage)
  dom.ts                 DOM 헬퍼, 다이얼로그, 토스트
  screens/hub.ts         허브 UI, 모달, 결과, 딥링크
  screens/play.ts        라운드 루프, 카메라 수명주기, 데모 포인터
  motion/                카메라, MediaPipe 포즈, 트래킹/펀치 판정
  game/                  게임 6종 + 공통 캔버스 아트/배경
  audio/                 Web Audio 합성 효과음 + MP3 배경 음악 제어
  fullscreen.ts          전체화면 진입/종료 (지원 브라우저)
public/
  models/                pose_landmarker_lite.task
  wasm/                  MediaPipe WASM (SIMD/모듈/no-SIMD)
  audio/                 caketown-1.mp3 (허브), riverside-ride.mp3 (게임)
  icons/, og.png, manifest.webmanifest, sw.js
scripts/
  make-icons.mjs         SVG → PNG 아이콘
  make-og.mjs            OG 이미지 캡처(개발 서버 필요)
  shots*.mjs             Playwright 화면 점검(개발 서버 + Edge 필요)
```

## 디자인 메모

- 종이 `#f7f1df`, 카드 `#fffdf6`, 잉크 `#1d1a3a`, 노랑 `#ffd23f`
- 강조색: 블루 `#2f5bff`, 코랄 `#ff6b57`, 민트 `#2ed3a0`
- 제목은 Jua, 본문은 Pretendard/시스템 폰트
- 모든 게임 아트는 캔버스/SVG로 그려 외부 이미지 의존이 없습니다.

## 개인정보

- 카메라 영상은 브라우저 안에서 자세 계산에만 쓰고 **저장·전송하지 않습니다.**
- 계정·광고·분석 도구가 없습니다.
- 기록은 기기의 `localStorage`에만 저장되며 설정에서 지울 수 있습니다.
- 자세한 내용: `/privacy.html`

## 알려진 제한

- 카카오톡·인스타그램 등의 인앱 브라우저에서는 카메라가 막힐 수 있습니다. 외부 브라우저로 열어 주세요.
- iOS Safari는 카메라 권한과 오디오 재생 정책이 브라우저 버전에 따라 다를 수 있습니다. 아이폰 Safari는 페이지 전체화면 API를 지원하지 않아 전체화면 버튼이 숨겨지고, 화면을 꽉 채운 놀이 화면으로 표시됩니다.
- 배경 음악은 첫 사용자 조작(페이지 터치, 놀이 시작 또는 소리 켜기) 뒤에 재생됩니다. 브라우저가 자동 재생을 막으면 다음 터치에서 다시 시도합니다.
- 탭/앱이 가려지면 음악을 일시정지하고, 돌아오면 이어서 재생합니다. 페이지를 닫거나 이동하면 완전히 멈춥니다.
- 2명 대결은 점수 기록을 저장하지 않고 스티커만 지급합니다.
- 서비스 워커는 빌드 결과에서만 등록되며, 앱 껍데기만 캐시합니다(모델/WASM 제외).
- 시크릿 모드나 사이트 데이터 삭제 시 기록이 사라집니다.

## 라이선스

개인·교육용으로 만든 프로토타입입니다. 폰트(Jua)는 SIL Open Font License, MediaPipe는 Apache-2.0을 따릅니다. 배경 음악(`public/audio/caketown-1.mp3`, `public/audio/riverside-ride.mp3`)은 사용자가 제공한 파일입니다.
