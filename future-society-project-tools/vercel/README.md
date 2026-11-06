# Vercel 배포 버전

claude.ai 안에서만 돌아가던 두 앱(`grader`, `chatbot`)을 일반 웹사이트로 배포하는 버전입니다. 화면(HTML)은 원본(`src/`)과 같고, AI 호출만 서버리스 함수(`api/`)가 대신합니다. API 키는 서버에만 있고 브라우저에는 노출되지 않습니다.

```
src/grader.html, src/chatbot.html   원본 화면 (claude.ai 버전과 같은 파일)
scripts/build.mjs                   원본 → public/ 완성 페이지 + api/_rules.js 생성
public/shim.js                      window.claude(sample, downloads)를 /api 호출로 바꿔 주는 어댑터
api/chat.js                         학생 챗봇. 안내문(RULES)은 서버가 보유. 학생 접속 코드 확인
api/grade.js                        교수 채점. 교수용 접속 코드 확인, 이미지 최대 3장
api/_lib.js                         코드 비교, 요청 횟수 제한, Anthropic 스트리밍 중계
```

주소: `/` 안내 첫 화면, `/chatbot/` 학생용, `/grader/` 교수용.

## 배포 순서 (교수님이 직접 하는 부분)
1. https://vercel.com 에 가입하고 GitHub 계정을 연결합니다.
2. **Add New → Project** 에서 `nam8-n/s1` 저장소를 가져옵니다.
3. 설정:
   - **Root Directory**: `future-society-project-tools/vercel`
   - **Framework Preset**: Other (나머지는 `vercel.json`이 정합니다)
   - 이 저장소의 기본 브랜치(`claude/diag-prototype`)는 다른 프로젝트입니다. 이 앱 브랜치(`claude/future-society-tools`)를 **Settings → Git → Production Branch**로 지정하거나, 먼저 이 브랜치를 기본 브랜치에 병합하세요.
4. **Environment Variables** (Production과 Preview 모두에 입력):

   | 이름 | 값 |
   |---|---|
   | `ANTHROPIC_API_KEY` | Anthropic Console에서 만든 API 키 |
   | `GRADER_PASSWORD` | 교수용 접속 코드. 길고 추측하기 어렵게 |
   | `STUDENT_ACCESS_CODE` | 학생 접속 코드. 수업 시간에만 알려 주세요 |

   선택: `MODEL_QUICK`, `MODEL_DEFAULT`, `MODEL_COMPLEX`(기본 haiku-5-5 / sonnet-5-5 / opus-5-5), `RATE_CHAT_MAX`(기본 30), `RATE_GRADE_MAX`(기본 60). 예시는 `.env.example`.
5. **Deploy** 를 누르고, 끝나면 `/chatbot/`과 `/grader/`에서 접속 코드를 넣어 한 번씩 써 봅니다.

## 비용과 보안
- **비용은 API 키 소유자(교수님)에게 청구됩니다.** Anthropic Console에서 월 사용 한도(Spend limit)를 꼭 걸어 두세요.
- 서버는 코드가 맞지 않으면 AI를 호출하지 않으며, 학생 코드를 설정하지 않으면(그리고 `ALLOW_PUBLIC_CHAT=true`도 아니면) 챗봇이 열리지 않습니다. 코드를 연달아 틀리면 잠시 차단됩니다.
- IP별 요청 제한은 서버리스 인스턴스마다 따로 세는 간이 방식입니다. 더 확실히 막으려면 Vercel **Firewall → Rate Limiting** 규칙을 `/api/*`에 추가하세요.
- Vercel의 미리보기(Preview) 배포는 기본적으로 Vercel 로그인이 필요합니다. 학생에게 줄 주소는 Production 주소를 쓰세요.
- 학생 질문과 제출물(채점용 글, 글자가 없는 쪽의 이미지)은 서버를 거쳐 Anthropic API로 전송됩니다. 학교의 개인정보·AI 사용 지침을 확인하세요. 8자리 학번은 채점 글에서 지우지만 이미지에서는 지우지 못합니다.
- 접속 코드는 브라우저 탭을 닫으면 사라지는 sessionStorage에만 저장됩니다. 대화 기록과 채점 결과는 각자의 브라우저 localStorage에만 저장됩니다.

## 고치고 확인하기
화면을 고칠 때는 `src/*.html`을 고치고 아래를 실행합니다(Node 20 이상).
```bash
cd future-society-project-tools/vercel
node scripts/build.mjs   # public/ 과 api/_rules.js 다시 만들기 (원문 문구가 바뀌어 치환이 어긋나면 오류로 멈춥니다)
npm test                 # 가짜 AI 서버로 접속 코드·한도·입력 검사·스트리밍 23개 항목 점검
```
`src/*.html`은 claude.ai 버전과 같은 파일입니다. 그쪽을 고쳤다면 이 폴더의 `src/`에도 같은 파일을 복사한 뒤 위 명령을 다시 실행하세요. 학생용 안내문(RULES)은 `src/chatbot.html`에서 고치면 `api/_rules.js`로 자동 반영됩니다(두 파일 모두 커밋).

내 컴퓨터에서 실제 키로 확인하려면 `.env`를 만들고(`.env.example` 참고) 실행합니다.
```bash
npm run dev   # http://localhost:3000
```

## 알려진 한계
- 실제 Anthropic API 호출과 PDF·PPTX 라이브러리(CDN) 로딩은 이 작업 환경에서 접속할 수 없어 시험하지 못했습니다. 가짜 AI 서버로 서버 함수와 두 화면의 호출 흐름만 확인했습니다. 배포 직후 PPTX 한 개, 글자 없는 PDF 한 개로 채점을 시험해 보세요.
- Vercel 요청 본문 한도는 4.5MB라서 글자 없는 쪽의 이미지는 한 번에 3장까지 보냅니다. 요금제에 따라 함수 최대 실행 시간(`vercel.json`의 300초)이 줄어들 수 있고, 정밀 채점이 길어지면 시간 초과가 날 수 있습니다.
- 모델 이름(`claude-sonnet-5-5` 등)은 환경 변수로 바꿀 수 있습니다. 호출이 "AI 서비스 오류"로 끝나면 Vercel 함수 로그에서 원인을 확인하세요.
