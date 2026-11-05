// 2027 신입생 기초학력 진단평가 - 설정 및 샘플 문항 (※ 샘플: 실제 문항은 센터·계열 대표 검수 후 교체)
window.CONFIG = {
  adminPin: "center2027",            // 시범용 PIN (운영 시 서버 인증으로 교체)
  minutesPerSubject: 20,
  cutLow: 50, cutHigh: 80,           // 정답률 %: <50 첫걸음 추천, 50~79 한 걸음 더, ≥80 함께 나눔
  // 학과 → 응용 문항 계열 (학과 목록은 실제 17개 학과로 수정)
  depts: {
    "간호학과":"nature","물리치료과":"nature","작업치료과":"nature","치위생과":"nature",
    "호텔외식과":"hotel","소방안전공학과":"eng","항공서비스경영과":"soc","기타 학과":"soc"
  },
  tracks: {
    first:{name:"첫걸음 트랙",goal:"작은 성공 경험과 자신감 회복, 기초 영역(문장 이해·단위 환산·비율 등) 보강",
      progs:["온라인 학습법 특강(문해력·리포트·시험대비)","튜터링(전공·기초)","Re-Start 학습상담","기초학습강화 집중 지도","필사 '오늘, 한 문장'","하계 캠프 '오늘 하나 완성'(나의 진단 결과 읽기)"]},
    step:{name:"한 걸음 더 트랙",goal:"학습 전략·습관 형성, 취약 영역 선택 보충",
      progs:["온라인 학습법 특강(자기주도 성장·AI 학습관리)","튜터링","필사 '오늘, 한 문장'","하계 캠프(학습법 진단·학기 로드맵)"]},
    share:{name:"함께 나눔 트랙",goal:"강점 확장, 설명·나눔 역할 경험, 튜터 역량 기초",
      progs:["온라인 학습법 특강(의사소통·리더십·AI 활용)","튜터링(튜터 참여)","비교과 외국어·정기 토익","학습성과 우수사례 경진대회"]}
  }
};
window.SUBJECTS = {math:"수리", kor:"국어", eng:"영어"};
window.TRACKNAME = {nature:"자연계열(간호·보건)", hotel:"자연계열(호텔외식)", eng:"공학계열", soc:"인문사회계열"};
const T=(s)=>s;
window.ITEMS = {
 math_common:[
  {d:"단위 환산",q:"2.5 kg은 몇 g입니까?",o:["25 g","250 g","2,500 g","25,000 g","250,000 g"],a:2},
  {d:"단위 환산",q:"750 mL는 몇 L입니까?",o:["0.075 L","0.75 L","7.5 L","75 L","750 L"],a:1},
  {d:"단위 환산",q:"2시간 15분은 몇 분입니까?",o:["115분","125분","135분","145분","215분"],a:2},
  {d:"비율·백분율",q:"40명 중 10명이 안경을 썼습니다. 안경을 쓴 학생의 비율은 몇 %입니까?",o:["4%","10%","25%","40%","75%"],a:2},
  {d:"비율·백분율",q:"20,000원인 물건을 25% 할인하여 판매합니다. 판매 가격은 얼마입니까?",o:["5,000원","10,000원","15,000원","17,500원","18,000원"],a:2},
  {d:"비율·백분율",q:"소금 20 g을 물 180 g에 녹였습니다. 소금물의 농도는 몇 %입니까?",o:["5%","9%","10%","11%","20%"],a:2},
  {d:"방정식",q:"일차방정식 3x + 5 = 20 의 해는 무엇입니까?",o:["3","4","5","6","15"],a:2},
  {d:"방정식",q:"연필 5자루와 800원짜리 지우개 1개를 샀더니 모두 3,300원이었습니다. 연필 한 자루의 가격은 얼마입니까?",o:["400원","450원","500원","550원","600원"],a:2},
  {d:"표·그래프 해석",c:"[월별 방문자 수]\n1월: 120명 | 2월: 150명 | 3월: 90명 | 4월: 180명",q:"방문자가 가장 적은 달은 언제입니까?",o:["1월","2월","3월","4월","알 수 없다"],a:2},
  {d:"표·그래프 해석",c:"[월별 방문자 수]\n1월: 120명 | 2월: 150명 | 3월: 90명 | 4월: 180명",q:"1월과 2월의 방문자 수를 합하면 몇 명입니까?",o:["210명","240명","270명","300명","330명"],a:2}
 ],
 math_app:{
  nature:[
   {d:"응용",q:"처방: 500 mg. 약 1정에 250 mg이 들어 있습니다. 몇 정을 주어야 합니까?",o:["1정","2정","3정","4정","5정"],a:1},
   {d:"응용",q:"체중 20 kg인 아동에게 체중 1 kg당 5 mg을 투여합니다. 투여할 용량은 몇 mg입니까?",o:["25 mg","50 mg","100 mg","200 mg","400 mg"],a:2},
   {d:"응용",q:"수액 500 mL를 4시간에 걸쳐 일정하게 주입합니다. 시간당 몇 mL입니까?",o:["100 mL","125 mL","150 mL","200 mL","250 mL"],a:1},
   {d:"응용",q:"20% 용액 100 mL에 들어 있는 용질은 몇 mL입니까?",o:["2 mL","10 mL","20 mL","50 mL","80 mL"],a:2},
   {d:"응용",q:"1회 10 mL를 하루 3회 먹습니다. 5일 동안 먹는 약은 모두 몇 mL입니까?",o:["30 mL","50 mL","100 mL","150 mL","300 mL"],a:3}],
  hotel:[
   {d:"응용",q:"4인분 레시피에 밀가루 200 g이 필요합니다. 10인분에는 몇 g이 필요합니까?",o:["400 g","450 g","500 g","600 g","800 g"],a:2},
   {d:"응용",q:"재료 원가가 3,000원이고 원가율을 30%로 하려면 판매가는 얼마입니까?",o:["6,000원","9,000원","10,000원","12,000원","15,000원"],a:2},
   {d:"응용",q:"설탕과 물을 1 : 4의 비율로 섞어 시럽 500 g을 만들려면 설탕은 몇 g이 필요합니까?",o:["50 g","100 g","125 g","200 g","400 g"],a:1},
   {d:"응용",q:"우유 1.5 L를 250 mL 컵에 가득 나누어 담으면 몇 컵입니까?",o:["4컵","5컵","6컵","7컵","8컵"],a:2},
   {d:"응용",q:"재료비 12,000원이 5% 올랐습니다. 오른 재료비는 얼마입니까?",o:["12,050원","12,500원","12,600원","13,000원","17,000원"],a:2}],
  eng:[
   {d:"응용",q:"일정한 속력으로 3분에 120 m를 갑니다. 10분에는 몇 m를 갑니까?",o:["300 m","360 m","400 m","1,200 m","1,600 m"],a:2},
   {d:"응용",q:"축척 1 : 50,000 지도에서 2 cm는 실제 거리로 얼마입니까?",o:["100 m","500 m","1 km","2 km","10 km"],a:2},
   {d:"응용",q:"V = IR 에서 I = 2 A, R = 6 Ω 일 때 V는 얼마입니까?",o:["3 V","4 V","8 V","12 V","18 V"],a:3},
   {d:"응용",q:"A와 B를 3 : 2의 비율로 섞어 모두 50 L를 만들려고 합니다. A는 몇 L입니까?",o:["20 L","25 L","30 L","32 L","40 L"],a:2},
   {d:"응용",q:"V = IR 에서 V = 24 V, R = 8 Ω 일 때 I는 얼마입니까?",o:["2 A","3 A","4 A","16 A","192 A"],a:1}],
  soc:[
   {d:"응용",q:"1달러가 1,300원일 때 200달러는 몇 원입니까?",o:["6,500원","26,000원","65,000원","260,000원","2,600,000원"],a:3},
   {d:"응용",q:"런던은 한국보다 9시간 늦습니다. 한국이 오후 3시일 때 런던은 몇 시입니까?",o:["오전 6시","오전 9시","오후 6시","오후 9시","오후 12시"],a:0},
   {d:"응용",q:"환전 수수료율이 3%입니다. 100,000원을 환전할 때 수수료는 얼마입니까?",o:["300원","1,000원","3,000원","30,000원","300,000원"],a:2},
   {d:"응용",q:"정가 10,000원인 상품을 20% 할인하면 얼마입니까?",o:["2,000원","7,000원","8,000원","9,000원","12,000원"],a:2},
   {d:"응용",q:"오전 9시에 출발하여 2시간 30분을 비행했습니다(같은 시간대). 도착 시각은 언제입니까?",o:["오전 11시","오전 11시 30분","낮 12시","낮 12시 30분","오후 1시"],a:1}]
 },
 kor:[
  {d:"독해",c:"수면은 단순히 쉬는 시간이 아니다. 잠을 자는 동안 우리 뇌는 낮에 배운 내용을 정리하고 기억으로 저장한다. 그래서 시험 전날 밤을 새우면 오히려 기억하기 어려워질 수 있다. 성인에게는 하루 7시간 이상의 수면이 권장된다. 규칙적인 시간에 자고 일어나는 습관도 수면의 질을 높이는 데 도움이 된다.",q:"이 글의 중심 내용으로 알맞은 것은?",o:["밤샘 공부는 효과가 크다","수면은 배운 내용을 정리·저장하는 중요한 시간이다","성인은 하루 5시간만 자면 된다","시험 전날에는 일찍 일어나야 한다","수면 습관은 사람마다 다르다"],a:1},
  {d:"독해",c:"(위 글) 수면은 단순히 쉬는 시간이 아니다. 잠을 자는 동안 우리 뇌는 낮에 배운 내용을 정리하고 기억으로 저장한다. 그래서 시험 전날 밤을 새우면 오히려 기억하기 어려워질 수 있다. 성인에게는 하루 7시간 이상의 수면이 권장된다. 규칙적인 시간에 자고 일어나는 습관도 수면의 질을 높이는 데 도움이 된다.",q:"성인에게 권장되는 하루 수면 시간은?",o:["5시간 이상","6시간 이상","7시간 이상","9시간 이상","10시간 이상"],a:2},
  {d:"독해",c:"(위 글) 수면은 단순히 쉬는 시간이 아니다. 잠을 자는 동안 우리 뇌는 낮에 배운 내용을 정리하고 기억으로 저장한다. 그래서 시험 전날 밤을 새우면 오히려 기억하기 어려워질 수 있다. 성인에게는 하루 7시간 이상의 수면이 권장된다. 규칙적인 시간에 자고 일어나는 습관도 수면의 질을 높이는 데 도움이 된다.",q:"시험 전날 밤을 새우면 생길 수 있는 일은?",o:["기억하기 어려워진다","시험 시간이 늘어난다","수면의 질이 높아진다","뇌가 쉬게 된다","배운 내용이 더 잘 정리된다"],a:0},
  {d:"독해",c:"(위 글) 수면은 단순히 쉬는 시간이 아니다. 잠을 자는 동안 우리 뇌는 낮에 배운 내용을 정리하고 기억으로 저장한다. 그래서 시험 전날 밤을 새우면 오히려 기억하기 어려워질 수 있다. 성인에게는 하루 7시간 이상의 수면이 권장된다. 규칙적인 시간에 자고 일어나는 습관도 수면의 질을 높이는 데 도움이 된다.",q:"'수면의 질'이 높다는 말의 뜻으로 가장 알맞은 것은?",o:["오래 자는 것","깊고 편안하게 잘 자는 것","낮에 자는 것","꿈을 많이 꾸는 것","늦게 자는 것"],a:1},
  {d:"독해",c:"(위 글) 수면은 단순히 쉬는 시간이 아니다. 잠을 자는 동안 우리 뇌는 낮에 배운 내용을 정리하고 기억으로 저장한다. 그래서 시험 전날 밤을 새우면 오히려 기억하기 어려워질 수 있다. 성인에게는 하루 7시간 이상의 수면이 권장된다. 규칙적인 시간에 자고 일어나는 습관도 수면의 질을 높이는 데 도움이 된다.",q:"이 글의 내용과 <u>맞지 않는</u> 것은?",o:["잠자는 동안 뇌는 기억을 저장한다","규칙적인 수면 습관이 도움이 된다","성인은 7시간 이상 자는 것이 좋다","수면은 단순한 휴식 시간이 아니다","잠을 자는 동안 뇌는 활동을 완전히 멈춘다"],a:4},
  {d:"독해",c:"손 씻기는 감염을 예방하는 가장 기본적인 방법이다. 비누를 묻혀 손바닥, 손등, 손가락 사이, 손톱 밑을 꼼꼼히 문질러야 한다. 흐르는 물에 30초 이상 씻는 것이 좋다. 물이 없을 때는 알코올 손소독제를 사용할 수 있지만, 눈에 보이는 오염이 있을 때는 물과 비누로 씻어야 한다.",q:"이 글의 중심 내용으로 알맞은 것은?",o:["손소독제가 비누보다 좋다","올바른 손 씻기는 감염 예방의 기본이다","손톱은 짧게 깎아야 한다","물은 아껴 써야 한다","감염은 피할 수 없다"],a:1},
  {d:"독해",c:"(위 글) 손 씻기는 감염을 예방하는 가장 기본적인 방법이다. 비누를 묻혀 손바닥, 손등, 손가락 사이, 손톱 밑을 꼼꼼히 문질러야 한다. 흐르는 물에 30초 이상 씻는 것이 좋다. 물이 없을 때는 알코올 손소독제를 사용할 수 있지만, 눈에 보이는 오염이 있을 때는 물과 비누로 씻어야 한다.",q:"흐르는 물에 손을 씻는 시간으로 권장되는 것은?",o:["5초 이상","10초 이상","20초 이상","30초 이상","3분 이상"],a:3},
  {d:"독해",c:"(위 글) 손 씻기는 감염을 예방하는 가장 기본적인 방법이다. 비누를 묻혀 손바닥, 손등, 손가락 사이, 손톱 밑을 꼼꼼히 문질러야 한다. 흐르는 물에 30초 이상 씻는 것이 좋다. 물이 없을 때는 알코올 손소독제를 사용할 수 있지만, 눈에 보이는 오염이 있을 때는 물과 비누로 씻어야 한다.",q:"손소독제를 사용하기에 알맞은 경우는?",o:["손에 흙이 묻었을 때","물이 없고 눈에 보이는 오염이 없을 때","화장실을 다녀온 직후 물이 있을 때","손에 음식물이 묻었을 때","손이 젖어 있을 때"],a:1},
  {d:"독해",c:"(위 글) 손 씻기는 감염을 예방하는 가장 기본적인 방법이다. 비누를 묻혀 손바닥, 손등, 손가락 사이, 손톱 밑을 꼼꼼히 문질러야 한다. 흐르는 물에 30초 이상 씻는 것이 좋다. 물이 없을 때는 알코올 손소독제를 사용할 수 있지만, 눈에 보이는 오염이 있을 때는 물과 비누로 씻어야 한다.",q:"'꼼꼼히'와 바꾸어 쓸 수 있는 말은?",o:["빠르게","빈틈없이 자세히","가볍게","조용히","한꺼번에"],a:1},
  {d:"독해",c:"(위 글) 손 씻기는 감염을 예방하는 가장 기본적인 방법이다. 비누를 묻혀 손바닥, 손등, 손가락 사이, 손톱 밑을 꼼꼼히 문질러야 한다. 흐르는 물에 30초 이상 씻는 것이 좋다. 물이 없을 때는 알코올 손소독제를 사용할 수 있지만, 눈에 보이는 오염이 있을 때는 물과 비누로 씻어야 한다.",q:"이 글의 내용과 <u>맞지 않는</u> 것은?",o:["손가락 사이도 문질러 씻어야 한다","손 씻기는 감염 예방의 기본이다","물이 없을 때 손소독제를 쓸 수 있다","흐르는 물에 30초 이상 씻는 것이 좋다","눈에 보이는 오염이 있어도 손소독제만 쓰면 된다"],a:4},
  {d:"지시문 이해",c:"[수강신청 안내]\n· 신청 기간: 3월 4일(월)~3월 6일(수), 오전 9시~오후 5시\n· 신청 방법: 학교 홈페이지에서만 가능\n· 정정 기간: 3월 7일(목) 하루",q:"수강신청 내용을 정정할 수 있는 날은?",o:["3월 4일","3월 5일","3월 6일","3월 7일","3월 8일"],a:3},
  {d:"지시문 이해",c:"[실습실 이용 안내]\n· 이용 시간: 평일 9시~18시\n· 사용 전 담당자의 승인을 받을 것\n· 마지막 사용자는 전원을 확인한 뒤 문을 잠글 것",q:"안내문의 내용과 같은 것은?",o:["주말에도 이용할 수 있다","승인 없이 이용할 수 있다","사용 전 담당자의 승인이 필요하다","마지막 사용자는 전원을 켜 둔다","밤 10시까지 이용할 수 있다"],a:2},
  {d:"지시문 이해",c:"[장학금 신청 안내]\n· 제출 서류: 신청서, 성적증명서\n· 마감: 금요일 17시\n· 접수 방법: 이메일 접수만 가능(방문 제출 불가)",q:"안내문대로 행동한 학생은?",o:["목요일에 방문하여 서류를 냈다","금요일 17시 전에 이메일로 서류를 냈다","토요일에 이메일로 서류를 냈다","신청서만 이메일로 냈다","금요일 18시에 이메일로 냈다"],a:1},
  {d:"지시문 이해",c:"[약 복용 안내]\n이 약은 식후 30분에 1회 1정씩, 하루 3회 복용하십시오. 졸음이 올 수 있으니 복용 후 운전을 피하십시오.",q:"이 약을 하루에 먹는 정은 모두 몇 정입니까?",o:["1정","2정","3정","4정","6정"],a:2},
  {d:"지시문 이해",c:"[시험 유의 사항]\n· 시험 시작: 오전 9시\n· 신분증을 지참하고, 시험 시작 10분 전까지 입실할 것\n· 휴대전화는 전원을 끄고 가방에 넣을 것\n· 지각 시 입실할 수 없음",q:"입실을 마쳐야 하는 시각은?",o:["오전 8시","오전 8시 30분","오전 8시 50분","오전 9시","오전 9시 10분"],a:2}
 ],
 eng:[
  {d:"독해",c:"Tom gets up at six every morning. He eats breakfast with his family and goes to school by bus. After school, he plays soccer with his friends for an hour. Then he goes home and does his homework. He goes to bed at ten.",q:"What time does Tom get up?",o:["At five","At six","At seven","At nine","At ten"],a:1},
  {d:"독해",c:"(Same text) Tom gets up at six every morning. He eats breakfast with his family and goes to school by bus. After school, he plays soccer with his friends for an hour. Then he goes home and does his homework. He goes to bed at ten.",q:"How does Tom go to school?",o:["By car","By bike","By bus","By subway","On foot"],a:2},
  {d:"독해",c:"(Same text) Tom gets up at six every morning. He eats breakfast with his family and goes to school by bus. After school, he plays soccer with his friends for an hour. Then he goes home and does his homework. He goes to bed at ten.",q:"What does Tom do after school?",o:["He plays soccer","He watches TV","He goes shopping","He cooks dinner","He goes to bed"],a:0},
  {d:"독해",c:"(Same text) Tom gets up at six every morning. He eats breakfast with his family and goes to school by bus. After school, he plays soccer with his friends for an hour. Then he goes home and does his homework. He goes to bed at ten.",q:"Which is true?",o:["Tom walks to school","Tom eats breakfast alone","Tom plays soccer for two hours","Tom does his homework at home","Tom gets up at ten"],a:3},
  {d:"독해",c:"(Same text) Tom gets up at six every morning. He eats breakfast with his family and goes to school by bus. After school, he plays soccer with his friends for an hour. Then he goes home and does his homework. He goes to bed at ten.",q:"Which is <u>NOT</u> true?",o:["Tom gets up at six","Tom eats breakfast with his family","Tom plays soccer with his friends","Tom does his homework after soccer","Tom goes to bed at nine"],a:4},
  {d:"독해",c:"Drinking enough water is important for our health. Water helps our body stay cool and carries nutrients to every part of the body. Doctors say we should drink about eight cups of water a day. If we do not drink enough, we may feel tired and have headaches.",q:"What is the main idea of the text?",o:["Doctors are very busy","Water is important for our health","Eight cups are too much","Headaches are common","Cool drinks are tasty"],a:1},
  {d:"독해",c:"(Same text) Drinking enough water is important for our health. Water helps our body stay cool and carries nutrients to every part of the body. Doctors say we should drink about eight cups of water a day. If we do not drink enough, we may feel tired and have headaches.",q:"How many cups of water should we drink a day?",o:["About two","About four","About six","About eight","About twelve"],a:3},
  {d:"독해",c:"(Same text) Drinking enough water is important for our health. Water helps our body stay cool and carries nutrients to every part of the body. Doctors say we should drink about eight cups of water a day. If we do not drink enough, we may feel tired and have headaches.",q:"What may happen if we do not drink enough water?",o:["We may feel tired","We may get taller","We may sleep less","We may feel cold","We may run faster"],a:0},
  {d:"독해",c:"(Same text) Drinking enough water is important for our health. Water helps our body stay cool and carries nutrients to every part of the body. Doctors say we should drink about eight cups of water a day. If we do not drink enough, we may feel tired and have headaches.",q:"The word 'carries' is closest in meaning to ______.",o:["moves","stops","breaks","hides","buys"],a:0},
  {d:"독해",c:"(Same text) Drinking enough water is important for our health. Water helps our body stay cool and carries nutrients to every part of the body. Doctors say we should drink about eight cups of water a day. If we do not drink enough, we may feel tired and have headaches.",q:"Which is <u>NOT</u> true?",o:["Water carries nutrients","Doctors recommend about eight cups","Not drinking enough can cause headaches","Water is important for health","Water makes our body hot"],a:4},
  {d:"지시문 이해",c:"[Notice]\nThe library is open from 9 a.m. to 6 p.m. on weekdays. It is closed on weekends.",q:"When is the library closed?",o:["On Monday","On Wednesday","On Friday","On weekends","At 5 p.m."],a:3},
  {d:"지시문 이해",c:"[Medicine]\nTake one tablet after each meal. Do not take more than three tablets a day.",q:"What is the most tablets you can take in one day?",o:["One","Two","Three","Four","Five"],a:2},
  {d:"지시문 이해",c:"[Test Rules]\nPlease turn off your cell phone during the test. You may not leave the room for the first 20 minutes.",q:"What should you do during the test?",o:["Use your cell phone","Turn off your cell phone","Leave the room early","Talk to a friend","Eat lunch"],a:1},
  {d:"지시문 이해",c:"[Report]\nSubmit your report by Friday, May 10. Late reports will lose 10 points per day.",q:"A student submits the report on Saturday, May 11. What happens?",o:["Nothing happens","The report is not accepted","The report loses 10 points","The report loses 50 points","The report gets 10 extra points"],a:2},
  {d:"지시문 이해",c:"[Lab Rule]\nPlease wash your hands before entering the lab.",q:"What must you do before entering the lab?",o:["Wash your hands","Take a test","Eat lunch","Call a teacher","Wear a hat"],a:0}
 ]
};
