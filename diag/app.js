(function(){
const C=CONFIG,$=s=>document.querySelector(s),app=$('#app'),bar=$('#bar');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY='diag_results';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const save=a=>{try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}};
let timer=null,me=null;
function items(subj,track){
  if(subj==='math'){
    if(window.MATH_BANK&&MATH_BANK[track]){              // 계열별 60문항 은행에서 학번 기준 A~D 세트 배정
      let h=0;for(const ch of me.sid)h=(h*31+ch.charCodeAt(0))>>>0;
      const f='ABCD'[h%4];return MATH_BANK[track].filter(x=>x.form===f).map(x=>({d:x.d,c:x.c,q:x.q,o:x.o,a:x.a}));
    }
    return ITEMS.math_common.concat(ITEMS.math_app[track]);
  }
  return ITEMS[subj];
}
function render(){
  clearInterval(timer);bar.classList.add('hide');
  if(location.hash==='#admin')return admin();
  home();
}
window.addEventListener('hashchange',render);

/* ---------- 학생 ---------- */
function home(){
  const done=me?load().filter(r=>r.sid===me.sid).map(r=>r.subject):[];
  app.innerHTML=`<div class="card"><h2>안내</h2>
   <p>이 평가는 점수를 매기기 위한 것이 아니라 <b>맞춤 지원을 위한 것</b>입니다. 과목당 15문항(5지선다), ${C.minutesPerSubject}분, 계산기는 사용하지 않습니다. 한 번에 한 과목씩 응시할 수 있습니다.</p></div>
   <div class="card"><h2>응시자 정보</h2>
   <label>학번</label><input id="sid" value="${me?esc(me.sid):''}">
   <label>이름</label><input id="nm" value="${me?esc(me.name):''}">
   <label>학과</label><select id="dp">${Object.keys(C.depts).map(d=>`<option ${me&&me.dept===d?'selected':''}>${d}</option>`).join('')}</select>
   <h2 style="margin-top:16px">응시 과목</h2>
   <div class="subj">${Object.entries(SUBJECTS).map(([k,v])=>`<button data-s="${k}" ${done.includes(k)?'disabled':''}>${v} ${done.includes(k)?'(완료)':''}</button>`).join('')}</div>
   ${done.length?'<button class="sec" id="rs">내 결과·추천 트랙 보기</button>':''}
   <p class="mut">※ 시범 프로그램입니다. 문항은 샘플이며 응시 결과는 이 브라우저에만 저장됩니다.</p></div>`;
  app.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{
    const sid=$('#sid').value.trim(),name=$('#nm').value.trim();
    if(!sid||!name){alert('학번과 이름을 입력해 주세요.');return}
    me={sid,name,dept:$('#dp').value};exam(b.dataset.s);});
  const rs=$('#rs');if(rs)rs.onclick=()=>{me={sid:$('#sid').value.trim(),name:$('#nm').value.trim(),dept:$('#dp').value};summary()};
}
function exam(subj){
  const track=C.depts[me.dept],list=items(subj,track);let left=C.minutesPerSubject*60;const t0=Date.now();
  bar.classList.remove('hide');$('#bt').textContent=SUBJECTS[subj]+' 영역';
  const tick=()=>{const m=Math.floor(left/60),s=left%60;$('#bp').textContent=`남은 시간 ${m}:${String(s).padStart(2,'0')}`;if(left--<=0){clearInterval(timer);finish(true)}};
  app.innerHTML=`<div class="card">${list.map((it,i)=>`<div class="q"><b>${i+1}. </b>${it.c?`<div class="ctx">${esc(it.c)}</div>`:''}${it.q}
   ${it.o.map((o,j)=>`<label class="opt"><input type="radio" name="q${i}" value="${j}">${'①②③④⑤'[j]} ${esc(o)}</label>`).join('')}</div>`).join('')}
   <button id="sub">제출하기</button></div>`;
  $('#sub').onclick=()=>finish(false);tick();timer=setInterval(tick,1000);
  function finish(auto){
    const ans=list.map((_,i)=>{const e=document.querySelector(`input[name=q${i}]:checked`);return e?+e.value:-1});
    const un=ans.filter(x=>x<0).length;
    if(!auto&&un&&!confirm(`${un}문항이 답하지 않은 상태입니다. 제출할까요?`))return;
    clearInterval(timer);
    const dom={};list.forEach((it,i)=>{const d=dom[it.d]=dom[it.d]||[0,0];d[1]++;if(ans[i]===it.a)d[0]++});
    const correct=Object.values(dom).reduce((a,b)=>a+b[0],0);
    const rec={sid:me.sid,name:me.name,dept:me.dept,track,subject:subj,dom,correct,total:list.length,unanswered:un,sec:Math.round((Date.now()-t0)/1000),ts:new Date().toISOString()};
    const all=load().filter(r=>!(r.sid===me.sid&&r.subject===subj));all.push(rec);save(all);
    bar.classList.add('hide');result(rec);
  }
}
const pct=(c,t)=>t?Math.round(c*100/t):0;
const trackOf=p=>p<C.cutLow?'first':p<C.cutHigh?'step':'share';
function result(rec){
  app.innerHTML=`<div class="card"><h2>${SUBJECTS[rec.subject]} 영역 응시를 마쳤습니다</h2>
   <p>${esc(rec.name)} 학생, 수고하셨습니다. 아래는 영역별 결과입니다.</p>${domBars(rec.dom)}</div>`+trackCard(rec.sid)+`<button id="back">처음으로</button>`;
  $('#back').onclick=()=>{location.hash='';home()};
}
function domBars(dom){return Object.entries(dom).map(([d,[c,t]])=>`<div style="margin:8px 0"><div>${esc(d)} <span class="mut">${c}/${t} (${pct(c,t)}%)</span></div><div class="bar"><i style="width:${pct(c,t)}%"></i></div></div>`).join('')}
function trackCard(sid){
  const rs=load().filter(r=>r.sid===sid);if(!rs.length)return'';
  const p=pct(rs.reduce((a,r)=>a+r.correct,0),rs.reduce((a,r)=>a+r.total,0)),T=C.tracks[trackOf(p)];
  const weak=Object.entries(rs.reduce((m,r)=>{for(const[d,[c,t]]of Object.entries(r.dom)){m[d]=m[d]||[0,0];m[d][0]+=c;m[d][1]+=t}return m},{})).map(([d,[c,t]])=>[d,pct(c,t)]).sort((a,b)=>a[1]-b[1]).slice(0,2);
  return`<div class="card"><h2>나에게 추천하는 트랙: ${T.name}</h2><p>${esc(T.goal)}</p>
   <p>먼저 살펴보면 좋은 영역: ${weak.map(w=>`<span class="tag">${esc(w[0])}</span>`).join('')}</p>
   <p><b>추천 프로그램</b></p><ul>${T.progs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
   <p class="mut">※ 추천 트랙은 참고용이며, 세 트랙 모두 누구나 자유롭게 선택·이동할 수 있습니다. 교수학습지원센터에서 학습상담을 신청할 수 있습니다.</p></div>`;
}
function summary(){
  if(!me.sid){alert('학번을 입력해 주세요.');return}
  const rs=load().filter(r=>r.sid===me.sid);
  app.innerHTML=`<div class="card"><h2>${esc(me.name)} 학생의 영역별 결과</h2>${rs.map(r=>`<h3>${SUBJECTS[r.subject]}</h3>${domBars(r.dom)}`).join('')||'응시 기록이 없습니다.'}</div>`+trackCard(me.sid)+`<button id="back">처음으로</button>`;
  $('#back').onclick=()=>{home()};
}

/* ---------- 센터 관리자 ---------- */
function admin(){
  if(sessionStorage.getItem('adm')!=='1'){
    app.innerHTML=`<div class="card"><h2>센터 관리자</h2><label>PIN</label><input id="pin" type="password"><button id="go">확인</button><p class="mut">※ 시범용 PIN입니다. 실제 운영에서는 서버 인증으로 대체해야 합니다.</p></div>`;
    $('#go').onclick=()=>{if($('#pin').value===C.adminPin){sessionStorage.setItem('adm','1');admin()}else alert('PIN이 맞지 않습니다.')};return;
  }
  const rs=load(),stu={};
  rs.forEach(r=>{const s=stu[r.sid]=stu[r.sid]||{sid:r.sid,name:r.name,dept:r.dept,track:r.track,c:0,t:0,dom:{},subs:[]};s.c+=r.correct;s.t+=r.total;s.subs.push(SUBJECTS[r.subject]);
    for(const[d,[c,t]]of Object.entries(r.dom)){const x=s.dom[d]=s.dom[d]||[0,0];x[0]+=c;x[1]+=t}});
  const S=Object.values(stu).map(s=>{s.p=pct(s.c,s.t);s.grp=trackOf(s.p);s.weak=Object.entries(s.dom).map(([d,[c,t]])=>[d,pct(c,t)]).sort((a,b)=>a[1]-b[1])[0];return s});
  const byDept={};S.forEach(s=>{const b=byDept[s.dept]=byDept[s.dept]||{n:0,c:0,t:0,dom:{}};b.n++;b.c+=s.c;b.t+=s.t;for(const[d,[c,t]]of Object.entries(s.dom)){const x=b.dom[d]=b.dom[d]||[0,0];x[0]+=c;x[1]+=t}});
  const gname={first:'첫걸음',step:'한 걸음 더',share:'함께 나눔'};
  const cnt=g=>S.filter(s=>s.grp===g).length;
  app.innerHTML=`<div class="card"><h2>응시 현황</h2><p>응시 학생 ${S.length}명 · 응시 기록 ${rs.length}건 · 추천 트랙: 첫걸음 ${cnt('first')} / 한 걸음 더 ${cnt('step')} / 함께 나눔 ${cnt('share')}</p>
   <button id="csv1">보충 필요 학생 명단(CSV)</button><button id="csv2" class="sec">전체 결과(CSV)</button><button id="clr" class="sec">데이터 초기화</button></div>
   <div class="card"><h2>학과별 현황</h2><table><tr><th>학과</th><th>응시</th><th>평균 정답률</th><th>취약 영역 상위 3</th></tr>
   ${Object.entries(byDept).map(([d,b])=>`<tr><td>${esc(d)}</td><td>${b.n}</td><td>${pct(b.c,b.t)}%</td><td>${Object.entries(b.dom).map(([k,[c,t]])=>[k,pct(c,t)]).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>`${esc(x[0])}(${x[1]}%)`).join(', ')}</td></tr>`).join('')||'<tr><td colspan=4>자료 없음</td></tr>'}</table></div>
   <div class="card"><h2>보충 필요 학생 명단 (하위 그룹: 정답률 ${C.cutLow}% 미만)</h2><table><tr><th>학번</th><th>이름</th><th>학과</th><th>정답률</th><th>가장 낮은 영역</th></tr>
   ${S.filter(s=>s.grp==='first').map(s=>`<tr><td>${esc(s.sid)}</td><td>${esc(s.name)}</td><td>${esc(s.dept)}</td><td>${s.p}%</td><td>${esc(s.weak[0])}(${s.weak[1]}%)</td></tr>`).join('')||'<tr><td colspan=5>해당 없음</td></tr>'}</table>
   <p class="mut">※ 학생 본인에게는 '성적'이 아닌 '추천 트랙'으로만 안내됩니다. 명단은 지원 목적에 한해 활용하세요.</p></div>`;
  const dl=(name,rows)=>{const b=new Blob(['﻿'+rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click()};
  $('#csv1').onclick=()=>dl('보충필요_명단.csv',[['학번','이름','학과','응시과목','정답률','가장 낮은 영역','추천 트랙']].concat(S.filter(s=>s.grp==='first').map(s=>[s.sid,s.name,s.dept,s.subs.join('/'),s.p,s.weak[0]+'('+s.weak[1]+'%)',gname[s.grp]])));
  $('#csv2').onclick=()=>dl('전체_결과.csv',[['학번','이름','학과','과목','정답','문항','미응답','소요(초)','영역별']].concat(rs.map(r=>[r.sid,r.name,r.dept,SUBJECTS[r.subject],r.correct,r.total,r.unanswered,r.sec,Object.entries(r.dom).map(([d,[c,t]])=>d+' '+c+'/'+t).join('; ')])));
  $('#clr').onclick=()=>{if(confirm('모든 응시 데이터를 삭제할까요?')){save([]);admin()}};
}
render();
})();
