// 학생용 도우미: 안내문(RULES)은 서버가 갖고, 브라우저는 대화 내용만 보냅니다.
import { RULES } from './_rules.js';
import { MODELS, json, safeEqual, clientIp, rateLimit, noteFailure, streamClaude } from './_lib.js';

const MAX_MSG_CHARS = 6000;
const MAX_TURNS = 14;

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: 'not_configured', message: '서버에 API 키가 설정되지 않았습니다.' });
  const code = process.env.STUDENT_ACCESS_CODE;
  if (!code && process.env.ALLOW_PUBLIC_CHAT !== 'true') {
    return json(503, { error: 'not_configured', message: '서버에 학생 접속 코드(STUDENT_ACCESS_CODE)가 설정되지 않았습니다.' });
  }
  const ip = clientIp(req);
  if (!rateLimit('chat:' + ip, Number(process.env.RATE_CHAT_MAX) || 30)) {
    return json(429, { error: 'rate_limited', message: '요청이 많습니다. 잠시 뒤 다시 보내 주세요.' });
  }
  if (code && !safeEqual(req.headers.get('x-access-code'), code)) {
    if (!noteFailure(ip)) return json(429, { error: 'rate_limited', message: '코드를 여러 번 틀렸습니다. 잠시 뒤 다시 시도하세요.' });
    return json(401, { error: 'access_denied', message: '접속 코드가 필요하거나 맞지 않습니다.' });
  }
  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'bad_request', message: '요청 형식이 올바르지 않습니다.' }); }
  let msgs = (Array.isArray(body && body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS);
  if (msgs.some((m) => m.content.length > MAX_MSG_CHARS)) {
    return json(413, { error: 'prompt_too_large', message: `한 번에 ${MAX_MSG_CHARS}자까지 보낼 수 있습니다.` });
  }
  msgs = msgs.map((m) => ({ role: m.role, content: m.content }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json(400, { error: 'bad_request', message: '마지막 메시지는 사용자 메시지여야 합니다.' });
  return streamClaude({ model: MODELS().default, system: RULES, messages: msgs, maxTokens: 1800, signal: req.signal });
}
