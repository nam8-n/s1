// src/*.html(claude.ai 버전과 같은 원본)을 Vercel용 완성 페이지로 바꿉니다.
// 실행: node scripts/build.mjs  → public/index.html, public/grader/index.html, public/chatbot/index.html, api/_rules.js 생성
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFileSync(join(root, p), 'utf8');
const wr = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

// 원문이 바뀌어 치환이 안 되면 배포를 멈춰서, 어긋난 안내문이 나가지 않게 합니다.
function swap(html, pairs, name) {
  for (const [from, to] of pairs) {
    if (!html.includes(from)) throw new Error(`[${name}] 바꿀 문구를 찾지 못했습니다: ${from.slice(0, 50)}`);
    html = html.replace(from, () => to);
  }
  return html;
}
const ERR_DENIED = (msg) => [`const ERR={not_granted:`, `const ERR={access_denied:'${msg}',not_granted:`];

const wrapPage = (body, mode) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow">
<style>:root{color-scheme:light dark}body{margin:0;font-size:14px}[hidden]{display:none!important}img{max-width:100%}</style>
<script>window.APP_MODE='${mode}'</script><script src="/shim.js"></script>
</head><body>
${body}
</body></html>
`;

// 교수용 채점기
let grader = swap(rd('src/grader.html'), [
  ['처음 누르면 Claude 사용 허용 창이 뜹니다.', '처음 누르면 교수용 접속 코드를 묻습니다.'],
  ['<li><b>허용 창이 안 뜨거나 거절했을 때</b>: 페이지를 새로 고친 뒤 다시 채점하세요.</li>', '<li><b>접속 코드를 물을 때</b>: 운영자가 정한 교수용 코드를 입력하세요. 틀렸다면 다시 채점을 눌러 입력합니다.</li>'],
  ['<li>채점 호출은 지금 로그인한 본인 Claude 계정의 사용량을 씁니다.</li>', '<li>채점 요청은 이 사이트의 서버를 거쳐 AI 서비스로 전송되며, 비용은 사이트 운영자의 API 계정에 청구됩니다.</li>'],
  ERR_DENIED('접속 코드가 맞지 않습니다. 다시 채점을 눌러 코드를 입력하세요.'),
], 'grader');
wr('public/grader/index.html', wrapPage(grader, 'grade'));

// 학생용 도우미: 안내문(RULES)은 서버로 옮기고 화면 쪽에는 남기지 않습니다.
let chat = rd('src/chatbot.html');
const m = chat.match(/const RULES=`([\s\S]*?)`;/);
if (!m) throw new Error('[chatbot] RULES를 찾지 못했습니다');
if (m[1].includes('${')) throw new Error('[chatbot] RULES 안에 ${ 가 있어 옮길 수 없습니다');
wr('api/_rules.js', `// 자동 생성: scripts/build.mjs (src/chatbot.html 의 RULES)\nexport const RULES = ${JSON.stringify(m[1])};\n`);
chat = chat.replace(m[0], () => "const RULES='(server)';");
chat = swap(chat, [
  ['<li>처음 보내면 Claude 사용 허용 창이 뜹니다. 허용해야 대화할 수 있습니다.</li>', '<li>접속 코드가 필요하면 처음 보낼 때 코드를 묻습니다. 선생님이 알려 준 코드를 입력하세요.</li>'],
  ['<li>질문은 지금 로그인한 본인 Claude 계정의 사용량으로 처리됩니다.</li>', '<li>질문은 서버를 거쳐 AI 서비스로 전송됩니다. 이름, 학번 같은 개인정보는 쓰지 마세요.</li>'],
  ['질문은 사용 중인 본인 Claude 계정으로 처리됩니다.', '질문은 서버를 거쳐 AI 서비스로 전송되니 이름과 학번 같은 개인정보는 쓰지 마세요.'],
  ERR_DENIED('접속 코드가 맞지 않거나 필요해요. 다시 보내면 코드를 물어봅니다.'),
], 'chatbot');
wr('public/chatbot/index.html', wrapPage(chat, 'chat'));

// 안내 첫 화면
wr('public/index.html', `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>미래사회 문제해결 프로젝트 도구</title>
<style>
:root{--bg:#f2f4f6;--panel:#fff;--ink:#15212c;--muted:#5b6874;--line:#d8dee4;--accent:#1b5e8c}
@media (prefers-color-scheme:dark){:root{--bg:#0e141a;--panel:#16202a;--ink:#e5ebf0;--muted:#97a5b2;--line:#2b3947;--accent:#6fb4e3;color-scheme:dark}}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.65 'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;padding:32px max(16px,env(safe-area-inset-left)) 48px}
main{max-width:720px;margin:0 auto}h1{font-size:24px;margin:0 0 6px;line-height:1.35}p{color:var(--muted);margin:0 0 20px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
a.card{display:block;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px;color:inherit;text-decoration:none}
a.card:hover,a.card:focus-visible{border-color:var(--accent);outline:none}
a.card b{display:block;font-size:17px;margin-bottom:4px}a.card span{color:var(--muted);font-size:14px}
small{display:block;margin-top:22px;color:var(--muted)}
</style></head><body><main>
<h1>미래사회와 문제해결능력 프로젝트 도구</h1>
<p>팀 프로젝트(20점) 루브릭을 바탕으로 만든 두 가지 도구입니다.</p>
<div class="cards">
<a class="card" href="/chatbot/"><b>학습 도우미 (학생용)</b><span>SCAMPER, 5Why, 로직트리, 악마의 주장법을 어떻게 적용할지 질문합니다. 선생님이 알려 준 접속 코드가 필요합니다.</span></a>
<a class="card" href="/grader/"><b>루브릭 채점기 (교수용)</b><span>팀별 PPT·PDF를 올려 영역별 등급과 근거를 제안받고 엑셀로 내보냅니다. 교수용 접속 코드가 필요합니다.</span></a>
</div>
<small>AI의 답변은 틀릴 수 있습니다. 채점 결과는 참고용 초안이며 최종 점수는 교수가 확정합니다.</small>
</main></body></html>
`);
console.log('build ok');
