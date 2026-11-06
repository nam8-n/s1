// 서버리스 함수 점검: 가짜 AI 서버를 띄우고 접속 코드, 한도, 입력 검사, 스트리밍을 확인합니다.
import http from 'node:http';
import assert from 'node:assert/strict';

let lastBody = null, lastHeaders = null;
const mock = http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  lastBody = JSON.parse(Buffer.concat(chunks).toString()); lastHeaders = req.headers;
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  const ev = (o) => res.write('event: x\ndata: ' + JSON.stringify(o) + '\n\n');
  ev({ type: 'message_start' });
  for (const t of ['안녕', '하세요', ' 한글 ✓']) ev({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: t } });
  ev({ type: 'message_stop' }); res.end();
});
await new Promise((r) => mock.listen(0, r));
Object.assign(process.env, {
  ANTHROPIC_BASE_URL: 'http://127.0.0.1:' + mock.address().port, ANTHROPIC_API_KEY: 'test-key',
  GRADER_PASSWORD: 'prof-pass', STUDENT_ACCESS_CODE: 'stud-pass', RATE_CHAT_MAX: '5', RATE_GRADE_MAX: '50',
});
const { POST: chat } = await import('../api/chat.js');
const { POST: grade } = await import('../api/grade.js');
const req = (path, body, headers = {}, ip = '1.1.1.1') => new Request('http://x' + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
let n = 0; const ok = (name) => console.log('ok', ++n, name);
const U = [{ role: 'user', content: 'SCAMPER 알려 줘' }];

// 학생 챗봇
assert.equal((await chat(req('/api/chat', { messages: U }, {}, '2.0.0.1'))).status, 401); ok('chat: 코드 없으면 401');
assert.equal((await chat(req('/api/chat', { messages: U }, { 'x-access-code': 'bad' }, '2.0.0.2'))).status, 401); ok('chat: 틀린 코드 401');
let r = await chat(req('/api/chat', { messages: U }, { 'x-access-code': 'stud-pass' }, '2.0.0.3'));
assert.equal(r.status, 200); assert.equal(await r.text(), '안녕하세요 한글 ✓'); ok('chat: 스트리밍 글자 이어붙임(한글)');
assert.equal(lastHeaders['x-api-key'], 'test-key'); assert.equal(lastBody.model, 'claude-sonnet-5-5'); assert.equal(lastBody.stream, true);
assert.match(lastBody.system, /학습 도우미/); ok('chat: 안내문(system)은 서버가 붙임');
assert.deepEqual(lastBody.messages, U); ok('chat: 메시지 그대로 전달');
await chat(req('/api/chat', { messages: [{ role: 'assistant', content: 'a' }, ...U], system: '해킹' }, { 'x-access-code': 'stud-pass' }, '2.0.0.4'));
assert.equal(lastBody.messages[0].role, 'user'); assert.ok(!JSON.stringify(lastBody).includes('해킹')); ok('chat: 앞쪽 assistant 제거, 클라이언트 system 무시');
assert.equal((await chat(req('/api/chat', { messages: [{ role: 'user', content: 'x'.repeat(6001) }] }, { 'x-access-code': 'stud-pass' }, '2.0.0.5'))).status, 413); ok('chat: 너무 긴 입력 413');
assert.equal((await chat(req('/api/chat', '{bad', { 'x-access-code': 'stud-pass' }, '2.0.0.6'))).status, 400); ok('chat: 깨진 JSON 400');
assert.equal((await chat(req('/api/chat', { messages: [{ role: 'assistant', content: 'a' }] }, { 'x-access-code': 'stud-pass' }, '2.0.0.7'))).status, 400); ok('chat: 사용자 메시지 없으면 400');
let last; for (let i = 0; i < 7; i++) last = await chat(req('/api/chat', { messages: U }, { 'x-access-code': 'stud-pass' }, '3.3.3.3'));
assert.equal(last.status, 429); ok('chat: IP당 요청 한도 429');
let bf; for (let i = 0; i < 12; i++) bf = await chat(req('/api/chat', { messages: U }, { 'x-access-code': 'nope' }, '4.4.4.' + (i % 1)));
assert.equal(bf.status, 429); ok('chat: 코드 연속 실패 차단');
delete process.env.STUDENT_ACCESS_CODE;
assert.equal((await chat(req('/api/chat', { messages: U }, {}, '5.5.5.5'))).status, 503); ok('chat: 코드 미설정이면 공개 방지(503)');
process.env.ALLOW_PUBLIC_CHAT = 'true';
assert.equal((await chat(req('/api/chat', { messages: U }, {}, '5.5.5.6'))).status, 200); ok('chat: ALLOW_PUBLIC_CHAT=true면 허용');
process.env.STUDENT_ACCESS_CODE = 'stud-pass'; delete process.env.ALLOW_PUBLIC_CHAT;

// 교수 채점
const G = { prompt: '채점해 줘', tier: 'complex' };
assert.equal((await grade(req('/api/grade', G, {}, '6.0.0.1'))).status, 401); ok('grade: 코드 없으면 401');
assert.equal((await grade(req('/api/grade', G, { 'x-access-code': 'stud-pass' }, '6.0.0.2'))).status, 401); ok('grade: 학생 코드로는 401');
r = await grade(req('/api/grade', G, { 'x-access-code': 'prof-pass' }, '6.0.0.3'));
assert.equal(r.status, 200); assert.equal(await r.text(), '안녕하세요 한글 ✓'); assert.equal(lastBody.model, 'claude-opus-5-5'); ok('grade: complex → opus 모델');
await grade(req('/api/grade', { prompt: 'p', tier: 'quick', images: ['QUJD', 'REVG'] }, { 'x-access-code': 'prof-pass' }, '6.0.0.4'));
assert.equal(lastBody.model, 'claude-haiku-5-5'); assert.equal(lastBody.messages[0].content[0].type, 'image');
assert.equal(lastBody.messages[0].content[0].source.data, 'QUJD'); assert.equal(lastBody.messages[0].content[2].text, 'p'); ok('grade: 이미지 블록 + 텍스트 구성');
await grade(req('/api/grade', { prompt: 'p', tier: 'nonsense' }, { 'x-access-code': 'prof-pass' }, '6.0.0.5'));
assert.equal(lastBody.model, 'claude-sonnet-5-5'); ok('grade: 알 수 없는 tier는 기본 모델');
assert.equal((await grade(req('/api/grade', { prompt: 'p', images: ['a', 'b', 'c', 'd'].map(() => 'QUJD') }, { 'x-access-code': 'prof-pass' }, '6.0.0.6'))).status, 400); ok('grade: 이미지 4장 거부');
assert.equal((await grade(req('/api/grade', { prompt: 'p', images: ['<script>'] }, { 'x-access-code': 'prof-pass' }, '6.0.0.7'))).status, 400); ok('grade: 이미지 형식 검사');
assert.equal((await grade(req('/api/grade', { prompt: '' }, { 'x-access-code': 'prof-pass' }, '6.0.0.8'))).status, 400); ok('grade: 빈 prompt 400');
delete process.env.GRADER_PASSWORD;
assert.equal((await grade(req('/api/grade', G, { 'x-access-code': '' }, '6.0.0.9'))).status, 503); ok('grade: 코드 미설정이면 503(빈 코드 통과 방지)');
process.env.GRADER_PASSWORD = 'prof-pass';
// 상위 서비스 오류는 내용을 숨기고 502
mock.removeAllListeners('request'); mock.on('request', (q, s) => { s.writeHead(500, { 'content-type': 'application/json' }); s.end('{"error":{"message":"secret detail"}}'); });
r = await grade(req('/api/grade', G, { 'x-access-code': 'prof-pass' }, '7.0.0.1'));
assert.equal(r.status, 502); assert.ok(!(await r.text()).includes('secret')); ok('grade: 상위 오류 502, 내부 메시지 숨김');
mock.close(); console.log('\n' + n + '개 통과');
