/* claude.ai 안에서만 있는 window.claude(sample, downloads)를 이 사이트의 /api 로 대신 이어 주는 작은 어댑터.
   페이지가 먼저 window.APP_MODE = 'chat' 또는 'grade' 를 정해 둡니다. */
(function () {
  'use strict';
  var MODE = window.APP_MODE;
  var URL_ = MODE === 'chat' ? '/api/chat' : '/api/grade';
  var KEY = 'access-code-' + MODE;

  function getCode() { try { return sessionStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function setCode(c) { try { sessionStorage.setItem(KEY, c); } catch (e) {} }

  function askCode(reason) {
    return new Promise(function (resolve) {
      var wrap = document.createElement('div');
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-modal', 'true');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px';
      var f = document.createElement('form');
      f.style.cssText = 'background:var(--panel,#fff);color:var(--ink,#111);border:1px solid var(--line,#ccc);border-radius:10px;padding:18px;max-width:380px;width:100%;display:flex;flex-direction:column;gap:10px;font:inherit';
      var t = document.createElement('div');
      t.style.fontWeight = '700';
      t.textContent = MODE === 'chat' ? '학생 접속 코드' : '교수용 접속 코드';
      var m = document.createElement('div');
      m.style.cssText = 'font-size:13px;color:var(--muted,#555)';
      m.textContent = reason || (MODE === 'chat' ? '선생님이 알려 준 코드를 입력하세요.' : '운영자가 정한 코드를 입력하세요.');
      var i = document.createElement('input');
      i.type = 'password'; i.autocomplete = 'off'; i.setAttribute('aria-label', '접속 코드');
      i.style.cssText = 'font:inherit;padding:8px 10px;border:1px solid var(--line,#ccc);border-radius:8px;background:var(--bg,#fff);color:inherit;width:100%';
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';
      var cancel = document.createElement('button');
      cancel.type = 'button'; cancel.textContent = '취소';
      var ok = document.createElement('button');
      ok.type = 'submit'; ok.textContent = '확인'; ok.className = 'primary';
      row.appendChild(cancel); row.appendChild(ok);
      f.appendChild(t); f.appendChild(m); f.appendChild(i); f.appendChild(row);
      wrap.appendChild(f); document.body.appendChild(wrap);
      i.focus();
      function done(v) { wrap.remove(); resolve(v); }
      cancel.onclick = function () { done(null); };
      f.onsubmit = function (e) { e.preventDefault(); done(i.value.trim() || null); };
    });
  }

  function blobToB64(b) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { rej(new Error('read')); };
      r.readAsDataURL(b);
    });
  }

  function err(code, message, text) { var e = { code: code, message: message }; if (text) e.text = text; return e; }

  async function post(body, opts, retried) {
    var res;
    try {
      res = await fetch(URL_, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-access-code': getCode() },
        body: JSON.stringify(body),
        signal: opts.signal,
      });
    } catch (e) {
      if (opts.signal && opts.signal.aborted) throw err('cancelled', 'cancelled');
      throw err('upstream_error', '서버에 연결하지 못했습니다.');
    }
    if (res.status === 401 && !retried) {
      var c = await askCode(getCode() ? '코드가 맞지 않습니다. 다시 입력하세요.' : '');
      if (!c) throw err('access_denied', '접속 코드가 필요합니다.');
      setCode(c);
      return post(body, opts, true);
    }
    if (!res.ok) {
      var j = {};
      try { j = await res.json(); } catch (e) {}
      var map = { 401: 'access_denied', 413: 'prompt_too_large', 429: 'rate_limited' };
      throw err(map[res.status] || 'upstream_error', j.message || '서버 오류가 발생했습니다.');
    }
    return res;
  }

  async function sample(input, opts) {
    opts = opts || {};
    var turns = typeof input === 'string' ? [{ role: 'user', content: input }] : input;
    var body;
    if (MODE === 'chat') {
      body = { messages: turns.slice(1).map(function (t) { return { role: t.role, content: t.content }; }) };
    } else {
      var imgs = [];
      var list = opts.images ? (Array.isArray(opts.images) ? opts.images : [opts.images]) : [];
      for (var k = 0; k < list.length; k++) imgs.push(await blobToB64(list[k]));
      body = {
        prompt: turns.map(function (t) { return t.content; }).join('\n\n'),
        tier: opts.modelTier || 'default',
        images: imgs,
      };
    }
    var res = await post(body, opts, false);
    var reader = res.body.getReader();
    var dec = new TextDecoder();
    var text = '';
    try {
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        var delta = dec.decode(r.value, { stream: true });
        if (!delta) continue;
        text += delta;
        if (opts.onText) { try { opts.onText({ text: text, delta: delta }); } catch (e) {} }
      }
    } catch (e) {
      if (opts.signal && opts.signal.aborted) throw err('cancelled', 'cancelled', text);
      throw err('upstream_error', '응답을 받는 중 연결이 끊어졌습니다.', text);
    }
    if (opts.signal && opts.signal.aborted) throw err('cancelled', 'cancelled', text);
    if (!text.trim()) throw err('empty_completion', '빈 응답');
    return { text: text, truncated: false };
  }

  sample.json = async function (input, opts) {
    var r = await sample(input, opts);
    var s = r.text.trim();
    var cands = [s];
    var fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) cands.push(fence[1].trim());
    var a = s.search(/[\[{]/);
    var z = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
    if (a >= 0 && z > a) cands.push(s.slice(a, z + 1));
    for (var i = 0; i < cands.length; i++) { try { return JSON.parse(cands[i]); } catch (e) {} }
    throw err('invalid_json', 'JSON 형식이 아닙니다.', r.text);
  };

  sample.limits = async function () {
    var l = { maxPromptBytes: 200000 };
    if (MODE === 'grade') l.images = { maxCount: 3, maxInputBytes: 4000000, mediaTypes: ['image/jpeg'] };
    return l;
  };

  var downloads = {
    save: async function (req) {
      var data = req.data;
      var blob = data instanceof Blob ? data : new Blob([data]);
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = req.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      return { status: 'saved' };
    },
  };

  window.claude = {
    use: async function (name) {
      if (name === 'sample') return sample;
      if (name === 'downloads') return downloads;
      return null;
    },
  };
})();
