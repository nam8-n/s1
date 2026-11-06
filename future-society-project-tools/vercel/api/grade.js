// 교수용 채점기: 브라우저가 만든 채점 요청(글 또는 이미지)을 접속 코드 확인 후 AI에 전달합니다.
import { MODELS, json, safeEqual, clientIp, rateLimit, noteFailure, streamClaude } from './_lib.js';

const MAX_PROMPT_CHARS = 200000;
const MAX_IMAGES = 3;
const MAX_IMAGE_B64 = 2_500_000; // 이미지 한 장당 base64 글자 수 (Vercel 요청 본문 한도 4.5MB 고려)

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: 'not_configured', message: '서버에 API 키가 설정되지 않았습니다.' });
  const pass = process.env.GRADER_PASSWORD;
  if (!pass) return json(503, { error: 'not_configured', message: '서버에 교수용 접속 코드(GRADER_PASSWORD)가 설정되지 않았습니다.' });
  const ip = clientIp(req);
  if (!rateLimit('grade:' + ip, Number(process.env.RATE_GRADE_MAX) || 60)) {
    return json(429, { error: 'rate_limited', message: '요청이 많습니다. 잠시 뒤 다시 시도하세요.' });
  }
  if (!safeEqual(req.headers.get('x-access-code'), pass)) {
    if (!noteFailure(ip)) return json(429, { error: 'rate_limited', message: '코드를 여러 번 틀렸습니다. 잠시 뒤 다시 시도하세요.' });
    return json(401, { error: 'access_denied', message: '접속 코드가 필요하거나 맞지 않습니다.' });
  }
  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'bad_request', message: '요청 형식이 올바르지 않습니다.' }); }
  const prompt = body && body.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) return json(400, { error: 'bad_request', message: 'prompt가 필요합니다.' });
  if (prompt.length > MAX_PROMPT_CHARS) return json(413, { error: 'prompt_too_large', message: '자료가 너무 깁니다.' });
  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > MAX_IMAGES) return json(400, { error: 'image_rejected', message: `이미지는 한 번에 ${MAX_IMAGES}장까지 보낼 수 있습니다.` });
  const content = [];
  for (const b64 of images) {
    if (typeof b64 !== 'string' || b64.length > MAX_IMAGE_B64 || !/^[A-Za-z0-9+/=]+$/.test(b64)) {
      return json(400, { error: 'image_rejected', message: '이미지를 처리할 수 없습니다.' });
    }
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } });
  }
  content.push({ type: 'text', text: prompt });
  const models = MODELS();
  const tier = ['quick', 'complex'].includes(body.tier) ? body.tier : 'default';
  return streamClaude({
    model: models[tier],
    messages: [{ role: 'user', content }],
    maxTokens: tier === 'quick' ? 6000 : 8000,
    signal: req.signal,
  });
}
