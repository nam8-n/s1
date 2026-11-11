// 문항 + 정답·해설 Word 생성: node build_review_docx.js <review.json> <출력 폴더>
const fs = require('fs'), path = require('path');
const d = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, BorderStyle, Footer, PageNumber } = d;
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outDir = process.argv[3];
const F = '맑은 고딕', LET = '①②③④⑤';
const SIZE = 20; // 10pt
const FILES = [
  ['math_nature', '수리', '자연계열(간호·물리치료·작업치료·치위생)', '수리_자연계열(간호보건)_문항_정답해설지.docx', '1~10번 공통 / 11~15번 자연계열 응용'],
  ['math_hotel', '수리', '자연계열(호텔외식)', '수리_호텔외식_문항_정답해설지.docx', '1~10번 공통 / 11~15번 호텔외식 응용'],
  ['math_eng', '수리', '공학계열', '수리_공학계열_문항_정답해설지.docx', '1~10번 공통 / 11~15번 공학 응용'],
  ['math_soc', '수리', '인문사회계열(항공서비스경영)', '수리_인문사회계열_문항_정답해설지.docx', '1~10번 공통 / 11~15번 인문사회 응용'],
  ['kor', '국어', '전 학과 공통', '국어_공통_문항_정답해설지.docx', '독해 10문항 + 지시문 이해 5문항'],
  ['eng', '영어', '전 학과 공통', '영어_공통_문항_정답해설지.docx', '독해 10문항 + 지시문 이해 5문항'],
];
const run = (t, o = {}) => new TextRun({ text: t, font: F, size: o.s || SIZE, bold: o.b, underline: o.u ? {} : undefined, color: o.c });
function rich(text, o = {}) { // <u>…</u> → 밑줄
  const out = []; let u = false;
  for (const part of text.split(/(<\/?u>)/)) {
    if (part === '<u>') u = true; else if (part === '</u>') u = false; else if (part) out.push(run(part, { ...o, u: u || o.u }));
  }
  return out;
}
const P = (children, o = {}) => new Paragraph({ children, spacing: { before: o.before || 0, after: o.after ?? 60, line: o.line || 276 }, indent: o.indent, keepNext: o.keepNext, keepLines: true, alignment: o.al, shading: o.shade, border: o.border, pageBreakBefore: o.pb });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const GRAY = 'F2F4F8', BLUE = '1F3864';

function ctxBlock(c) {
  const lines = c.split('\n');
  return lines.map((ln, i) => P([run(ln, { s: 19 })], {
    after: i === lines.length - 1 ? 100 : 0, indent: { left: 120, right: 120 },
    shade: { type: ShadingType.CLEAR, fill: GRAY, color: 'auto' },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: '4A6FA5', space: 6 } }, keepNext: true,
  }));
}
function questionParas(b, showCtx) {
  const ps = [];
  if (showCtx) ps.push(...ctxBlock(b.c));
  else if (b.c) ps.push(P([run(b.c.includes('|') ? '(위 표를 보고 답하시오.)' : (b.c.startsWith('[') ? '(위 안내문을 읽고 답하시오.)' : '(위 글을 읽고 답하시오.)'), { s: 17, c: '666666' })], { after: 40, keepNext: true }));
  ps.push(P([run(`${b.no}. `, { b: true }), ...rich(b.q)], { before: 40, after: 40, keepNext: true, indent: { left: 360, hanging: 360 } }));
  const opts = b.o.map((o, j) => `${LET[j]} ${o}`);
  const short = opts.join('   ').length <= 62;
  if (short) ps.push(P([run(opts.join('     '))], { indent: { left: 360 }, after: 110 }));
  else opts.forEach((o, j) => ps.push(P([run(o)], { indent: { left: 600, hanging: 240 }, after: j === 4 ? 110 : 20, keepNext: j < 4 })));
  return ps;
}
function cell(text, w, o = {}) {
  const bd = { style: BorderStyle.SINGLE, size: 4, color: '9AA5B8' };
  return new TableCell({
    width: { size: w, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 90, right: 90 },
    borders: { top: bd, bottom: bd, left: bd, right: bd },
    shading: o.head ? { type: ShadingType.CLEAR, fill: 'D9E2F3', color: 'auto' } : undefined, verticalAlign: 'center',
    children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { after: 0, line: 260 }, children: rich(text, { s: 18, b: o.b || o.head }) })],
  });
}
function answerTable(items) {
  const W = [650, 1750, 800, 7100];
  const rows = [new TableRow({ tableHeader: true, cantSplit: true, children: [cell('번호', W[0], { head: 1, center: 1 }), cell('영역·난이도', W[1], { head: 1, center: 1 }), cell('정답', W[2], { head: 1, center: 1 }), cell('풀이·해설', W[3], { head: 1, center: 1 })] })];
  for (const b of items) rows.push(new TableRow({ cantSplit: true, children: [
    cell(String(b.no), W[0], { center: 1 }), cell(`${b.d}·${b.lv}`, W[1], { center: 1 }),
    cell(`${LET[b.a]}`, W[2], { center: 1, b: 1 }), cell(`${b.o[b.a]} — ${b.ex}`, W[3])] }));
  return new Table({ width: { size: W.reduce((a, c) => a + c), type: WidthType.DXA }, columnWidths: W, rows });
}
const H1 = (t, pb) => P([run(t, { s: 30, b: true, c: BLUE })], { before: 0, after: 120, keepNext: true, pb });
const H2 = (t, pb) => P([run(t, { s: 26, b: true, c: BLUE })], { before: 120, after: 100, keepNext: true, pb, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 2 } } });

for (const [key, subj, name, file, comp] of FILES) {
  const bank = data[key], kids = [];
  kids.push(P([run('2027학년도 신입생 기초학력 진단평가', { s: 22, c: '595959' })], { after: 40, al: AlignmentType.CENTER }));
  kids.push(P([run(`${subj} 문항 및 정답·해설지`, { s: 38, b: true, c: BLUE })], { after: 40, al: AlignmentType.CENTER }));
  kids.push(P([run(`${name}`, { s: 24, b: true })], { after: 40, al: AlignmentType.CENTER }));
  kids.push(P([run(`세트 A~D(세트당 15문항, 총 60문항) · ${comp} · 5지선다 · 중2~3 수준 · 20분`, { s: 18, c: '595959' })], { after: 40, al: AlignmentType.CENTER }));
  kids.push(P([run('※ 검수 전 초안입니다. 계열 대표·담당 교수의 검토 후 확정하십시오.', { s: 18, c: 'B00020' })], { after: 160, al: AlignmentType.CENTER }));
  kids.push(P([run('난이도 구성(세트당): 기초 11 + 표준 3 + 변별 1  |  정답 위치 ①~⑤ 균등 배치', { s: 18 })], { after: 60 }));
  kids.push(P([run('목차: Ⅰ. 문항지(세트 A~D)  /  Ⅱ. 정답 및 해설(세트 A~D)', { s: 18 })], { after: 60 }));
  // Ⅰ. 문항지
  let first = true;
  for (const f of 'ABCD') {
    const items = bank.filter(b => b.form === f);
    kids.push(H1(`Ⅰ. 문항지 — 세트 ${f}`, f !== 'A'));
    kids.push(P([run(`${name} · 시간 20분 · 이름: ____________  학번: ____________`, { s: 18, c: '595959' })], { after: 120 }));
    let last = null;
    for (const b of items) { kids.push(...questionParas(b, b.c && b.c !== last)); last = b.c; }
  }
  // Ⅱ. 정답·해설
  for (const f of 'ABCD') {
    const items = bank.filter(b => b.form === f);
    kids.push(H1(`Ⅱ. 정답 및 해설 — 세트 ${f}`, true));
    kids.push(P([run('정답 한눈에 보기: ' + items.map(b => `${b.no}${LET[b.a]}`).join('  '), { s: 18, b: true })], { after: 120 }));
    kids.push(answerTable(items));
  }
  const doc = new Document({
    styles: { default: { document: { run: { font: F, size: SIZE } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${subj} · ${name}  |  `, font: F, size: 16, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], font: F, size: 16, color: '777777' })] })] }) },
      children: kids,
    }],
  });
  Packer.toBuffer(doc).then(buf => { fs.writeFileSync(path.join(outDir, file), buf); console.log('wrote', file, (buf.length / 1024).toFixed(0) + 'KB'); });
}
