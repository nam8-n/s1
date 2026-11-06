// 두 API가 함께 쓰는 도구: 응답 만들기, 코드 비교, 요청 횟수 제한, Anthropic 스트리밍 중계
import { timingSafeEqual } from 'node:crypto';

export const MODELS = () => ({
  quick: process.env.MODEL_QUICK || 'claude-haiku-5-5',
  default: process.env.MODEL_DEFAULT || 'claude-sonnet-5-5',
  complex: process.env.MODEL_COMPLEX || 'claude-opus-5-5',
});

export function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function safeEqual(a, b) {
  const A = Buffer.from(String(a || ''));
  const B = Buffer.from(String(b || ''));
  return A.length === B.length && timingSafeEqual(A, B);
}

export function clientIp(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

// 서버리스 인스턴스마다 따로 세는 간이 제한입니다. 완전한 차단은 Vercel 방화벽(Rate Limit) 규칙을 함께 쓰세요.
const hits = new Map();
export function rateLimit(key, max, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k);
  }
  return true;
}
export function noteFailure(key, max = 10) {
  return rateLimit('fail:' + key, max);
}

// Anthropic Messages API를 스트리밍으로 부르고, 글자 조각만 이어서 돌려줍니다.
export async function streamClaude({ model, system, messages, maxTokens, signal }) {
  const base = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
  let r;
  try {
    r = await fetch(base + '/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages, stream: true }),
      signal,
    });
  } catch (e) {
    console.error('upstream connect failed', e && e.message);
    return json(502, { error: 'upstream', message: 'AI 서비스에 연결하지 못했습니다.' });
  }
  if (!r.ok) {
    let m = '';
    try { m = ((await r.json()).error || {}).message || ''; } catch {}
    console.error('upstream error', r.status, m);
    return r.status === 429
      ? json(429, { error: 'rate_limited', message: 'AI 서비스 사용 한도에 도달했습니다. 잠시 뒤 다시 시도하세요.' })
      : json(502, { error: 'upstream', message: 'AI 서비스 오류가 발생했습니다. 다시 시도하세요.' });
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = '';
  const out = new ReadableStream({
    async pull(ctrl) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) { ctrl.close(); return; }
        buf += dec.decode(value, { stream: true });
        let text = '';
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (!line.startsWith('data:')) continue;
          let ev;
          try { ev = JSON.parse(line.slice(5).trim()); } catch { continue; }
          if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') text += ev.delta.text;
          else if (ev.type === 'error') {
            if (text) ctrl.enqueue(enc.encode(text));
            ctrl.error(new Error('upstream stream error'));
            return;
          }
        }
        if (text) { ctrl.enqueue(enc.encode(text)); return; }
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
  return new Response(out, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' },
  });
}
