# ★ Prompt Archive

레트로 패션 기기로 위장한 작은 의상 프롬프트 생성기입니다.

**Prompt Archive**는 NovelAI 등 이미지 생성 도구에서 활용할 수 있는 패션 프롬프트를 무작위로 조합해 주는 브라우저 기반 프로젝트입니다. 현재 에디션인 **Prompt Archive 2004**는 Y2K 전자기기, MP3 플레이어, 폴더폰, 다마고치, 초기 데스크톱 UI와 2000년대의 귀여운 디지털 인터페이스에서 영감을 받았습니다.

AI API나 별도의 서버는 필요하지 않습니다. 모든 결과는 미리 정의된 의상 요소와 호환 규칙을 바탕으로 브라우저 안에서 생성됩니다.

---

## Prompt Archive 2004

다음 스타일을 바탕으로 의상 조합을 만들 수 있습니다.

- Y2K Street
- Soft Grunge
- Cyber Y2K
- Metallic Gothic
- Aviator
- Animal Street
- Cyber Angel
- Doll Goth
- Webcore
- Winter Utility
- Sport Tech
- McBling Y2K
- Acubi Tech
- Visual Kei
- Cyber Rave

실루엣, 상의, 하의, 신발, 액세서리, 머리 장식과 선택적 모티프를 하나의 영어 프롬프트로 조합합니다.

## 주요 기능

### 의상 랜덤 생성

각 의상은 다음 항목을 조합해 만들어집니다.

- 색상
- 메인 스타일과 호환되는 보조 스타일
- 실루엣
- 상의와 하의
- 신발
- 머리 장식
- 액세서리
- 동물 모티프
- 직접 입력한 추가 태그
- 복잡도

스타일은 완전히 무작위로 섞이지 않고 서로 어울리는 조합 규칙을 따릅니다. 예를 들어 Cyber Y2K에는 Headset, Aviator에는 Goggles, Metallic Gothic에는 Horns처럼 스타일에 맞는 요소가 연결됩니다.

### 머리 장식

다음 머리 장식을 선택하거나 무작위로 정할 수 있습니다.

- Headset
- Animal Hood
- Goggles
- Halo
- Horns
- Visor
- Beanie
- None

선택한 머리 장식은 의상의 추가 디테일에도 영향을 줄 수 있습니다.

### 동물 모티프

기본 모티프는 Rabbit, Cat, Dog, Hamster, Bear입니다. 동물은 귀 장식만 추가하는 것이 아니라 의상의 실루엣 경향에도 영향을 줍니다.

- Rabbit → 길고 늘어지는 형태
- Cat → 날렵하고 뾰족한 형태
- Dog → 느슨하고 묵직한 형태
- Hamster → 둥글고 아담한 형태
- Bear → 부피감 있고 포근한 형태

`Other...`를 선택하면 원하는 동물 이름을 직접 입력할 수 있습니다.

### 추가 태그

`OTHER` 입력란에는 기본 생성기에 없는 요소를 쉼표로 구분해 추가할 수 있습니다.

```text
wings, ribbons, chains
```

입력한 태그는 생성된 의상 프롬프트의 끝에 덧붙습니다.

### 복잡도

- **Simple** — 기본 의상 구조와 적은 수의 디테일을 사용합니다.
- **Medium** — 액세서리와 `detailed clothing` 태그를 추가합니다.
- **Max** — 더 많은 액세서리와 특수 요소를 사용하고 `layered accessories, highly detailed clothing` 태그를 추가합니다.
- **Random** — 출력할 때마다 위 세 단계 중 하나를 선택합니다.

### 색상

선택한 색상은 생성된 프롬프트의 맨 앞에 한 번만 기록됩니다.

```text
black, cyber y2k streetwear, technical baggy silhouette, cropped technical jacket, strapped cargo pants, oversized futuristic headset, cable details, futuristic platform sneakers
```

덕분에 여러 색상 태그를 일일이 고치지 않고도 전체 색상 테마를 간단히 바꿀 수 있습니다.

### 인터페이스 테마

`THEME` 버튼에서 Blue, Yellow, Lime, Pink, Monochrome 테마를 선택할 수 있습니다. 테마는 인터페이스 색상만 바꾸며, 생성되는 의상의 색상에는 영향을 주지 않습니다.

### 프롬프트 출력

`PRINT OUTFIT`을 누르면 새 의상 프롬프트가 영수증처럼 출력됩니다.

- `COPY` — 결과를 클립보드에 복사합니다.
- `SAVE .TXT` — 결과를 텍스트 파일로 저장합니다.
- `REPRINT` — 현재 설정을 유지한 채 새 조합을 출력합니다.
- `✂ DRAG TO TEAR` — 출력된 영수증을 떼어 냅니다.

### 설정 잠금

각 설정 옆의 `◇` 버튼을 누르면 `◆`로 바뀌며 해당 값을 잠급니다. 잠긴 값은 `SHUFFLE PARTS`를 눌러도 유지되므로, 원하는 스타일이나 색상만 고정한 채 나머지 요소를 다시 조합할 수 있습니다.

## 사용 방법

설치 과정은 없습니다.

1. 저장소를 내려받습니다.
2. `index.html`을 웹 브라우저에서 엽니다.
3. 원하는 조건을 선택하고 `PRINT OUTFIT`을 누릅니다.

별도의 빌드 과정이 없는 정적 웹 프로젝트이므로 GitHub Pages에도 바로 게시할 수 있습니다.

```text
PromptArchive-2004/
├── index.html   # 화면 구조
├── styles.css   # 테마와 인터페이스 스타일
├── data.js      # 의상 데이터와 호환 규칙
└── app.js       # 프롬프트 생성 및 화면 동작
```

## 기술 구성

- HTML
- CSS
- Vanilla JavaScript

백엔드, 데이터베이스, AI API, 계정 시스템 없이 브라우저에서만 동작합니다.

## 폰트

인터페이스는 MonadABXY의 픽셀 폰트 **Mona**를 CDN 웹폰트로 불러옵니다. 폰트를 불러올 수 없는 환경에서는 시스템 폰트로 대체됩니다.

Mona는 SIL Open Font License 1.1에 따라 배포됩니다.

## 앞으로의 에디션

Prompt Archive는 하나의 생성기에 그치지 않고 서로 다른 분위기의 시리즈로 확장할 수 있도록 구상했습니다.

- **Prompt Archive 2004** — Y2K / cyber / street / alternative fashion
- **Prompt Archive: Rosette** — romance fantasy / dresses / corsets / ribbons / lace
- **Prompt Archive: Nocturne** — gothic / Visual Kei / dark fantasy / cathedral fashion
- **Prompt Archive: Sugarbox** — kawaii / doll / pastel / plush fashion
- **Prompt Archive: Flight Log** — aviator / utility / dieselpunk

각 에디션은 Prompt Archive라는 기본 콘셉트를 공유하면서 서로 다른 의상 데이터와 인터페이스를 사용할 수 있습니다.

## 프로젝트 방향

이 프로젝트의 목표는 역사적 패션을 완벽하게 재현하는 것이 아닙니다. 캐릭터 의상 디자인, 과장된 실루엣, 믹스 앤 매치, 아바타 스타일링과 빠른 프롬프트 실험을 위한 창작 도구를 지향합니다.

## 라이선스

이 프로젝트의 애플리케이션 코드는 [MIT License](LICENSE)에 따라 사용할 수 있습니다. 폰트를 포함한 제3자 자산에는 각 자산의 라이선스가 적용됩니다.

---

★ 스타일을 섞고, 의상을 출력하고, 마음에 드는 조합을 아카이브하세요.
