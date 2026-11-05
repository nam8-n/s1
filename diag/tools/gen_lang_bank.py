#!/usr/bin/env python3
"""국어·영어 문항은행 생성·검증: 과목당 4세트(A~D) × 15문항(독해 10 + 지시문 이해 5) = 60문항. 전 학과 공통.
세트당 난이도: 기초 11 + 표준 3 + 변별 1. 독해 지문은 5문장 이내(평가 설계 기준).
출력: items_lang.js, docs/국어_공통_60문항.(md|csv), docs/영어_공통_60문항.(md|csv)
문항은 이 파일에 작성하고(정답 = 각 항목의 두 번째 인자), 보기 순서·정답 위치는 시드 고정 무작위로 균등 배치한다."""
import json, csv, os, re, random
from collections import Counter

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RD, IN = "독해", "지시문 이해"
B, S, H = "기초", "표준", "변별"


def item(d, lv, ctx, q, ans, dis):
    assert len(dis) == 4 and ans not in dis and len(set(dis)) == 4, (q, ans, dis)
    return dict(d=d, lv=lv, c=ctx, q=q, key=ans, o=[ans] + list(dis), a=0)


def passage(ctx, rows):      # rows: [(난이도, 문제, 정답, [오답4])]
    return [item(RD, lv, ctx, q, ans, dis) for lv, q, ans, dis in rows]


def notices(rows):           # rows: [(난이도, 안내문, 문제, 정답, [오답4])]
    return [item(IN, lv, ctx, q, ans, dis) for lv, ctx, q, ans, dis in rows]


NK = "맞지 <u>않는</u> 것은?"
KOR, ENG = {}, {}

# =============================================================== 국어 A
KOR["A"] = passage(
    "강의를 들으면서 메모하는 습관은 학습에 큰 도움이 된다. 들은 내용을 자기 말로 다시 적으면 내용을 더 깊이 이해할 수 있다. 또한 메모는 나중에 복습할 때 중요한 부분을 빠르게 찾게 해 준다. 그러나 모든 말을 그대로 받아 적으면 오히려 수업에 집중하기 어렵다. 그래서 핵심 단어와 중요한 내용만 간단히 적는 것이 좋다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "핵심만 간단히 메모하는 습관이 학습에 도움이 된다", ["강의는 반드시 녹음해야 한다", "모든 말을 받아 적어야 한다", "메모는 복습할 때만 필요하다", "수업에서는 메모보다 질문이 중요하다"]),
     (B, "메모가 복습할 때 주는 도움은 무엇입니까?", "중요한 부분을 빠르게 찾게 해 준다", ["시험 문제를 미리 알려 준다", "수업 시간을 줄여 준다", "강의 내용을 대신 외워 준다", "교수님과 친해지게 해 준다"]),
     (B, "모든 말을 그대로 받아 적으면 어떤 문제가 생깁니까?", "수업에 집중하기 어렵다", ["복습이 쉬워진다", "내용을 더 깊이 이해한다", "시간이 남는다", "글씨가 예뻐진다"]),
     (B, "'핵심'의 뜻으로 알맞은 것은?", "가장 중요한 부분", ["가장 쉬운 부분", "처음 나오는 부분", "가장 긴 부분", "마지막 부분"]),
     (S, "이 글의 내용과 " + NK, "메모할 때는 들은 말을 모두 그대로 적어야 한다", ["자기 말로 다시 적으면 더 깊이 이해할 수 있다", "메모는 복습할 때 도움이 된다", "핵심 단어를 적는 것이 좋다", "메모하는 습관은 학습에 도움이 된다"])]
) + passage(
    "실내 공기가 나쁘면 졸음이 오고 집중력이 떨어질 수 있다. 사람이 많은 교실에서는 숨을 쉴 때 나오는 이산화탄소가 쌓이기 때문이다. 따라서 수업 중간의 쉬는 시간에 창문을 열어 환기하는 것이 좋다. 환기는 하루에 두세 번, 한 번에 10분 정도 하면 충분하다. 미세먼지가 심한 날에는 짧게 자주 환기하는 방법이 알맞다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "실내 공기를 알맞게 환기해야 한다", ["미세먼지가 있으면 창문을 닫아야 한다", "교실은 넓을수록 좋다", "졸음은 약으로 해결해야 한다", "쉬는 시간이 더 길어야 한다"]),
     (B, "권장하는 환기 방법으로 알맞은 것은?", "하루에 두세 번, 한 번에 10분 정도", ["하루에 한 번, 한 번에 1시간", "하루에 열 번, 한 번에 1분", "수업 시간 내내 창문을 열어 둔다", "일주일에 한 번 환기한다"]),
     (B, "미세먼지가 심한 날 알맞은 환기 방법은?", "짧게 자주 환기한다", ["하루 종일 창문을 열어 둔다", "한 번만 길게 환기한다", "환기를 전혀 하지 않는다", "수업 중에만 환기한다"]),
     (S, "사람이 많은 교실에서 졸음이 오기 쉬운 까닭은?", "이산화탄소가 쌓이기 때문이다", ["조명이 어둡기 때문이다", "창문을 자주 열기 때문이다", "수업이 길기 때문이다", "책이 무겁기 때문이다"]),
     (H, "이 글의 내용과 " + NK, "환기는 수업 시간 내내 계속해야 효과가 있다", ["공기가 나쁘면 집중력이 떨어질 수 있다", "쉬는 시간에 환기하는 것이 좋다", "사람이 많으면 이산화탄소가 쌓인다", "미세먼지가 심한 날에는 짧게 자주 환기한다"])]
) + notices([
    (B, "[도서관 이용 안내]\n· 이용 시간: 평일 9시~21시, 토요일 9시~13시\n· 일요일과 공휴일은 쉽니다.\n· 책은 1인당 5권까지 14일간 빌릴 수 있습니다.", "도서관을 이용할 수 없는 날은?", "일요일", ["월요일", "수요일", "금요일", "토요일"]),
    (B, "[건강검진 안내]\n· 대상: 신입생 전원\n· 장소: 보건실(학생회관 1층)\n· 일시: 3월 12일(화)~14일(목), 오전 10시~오후 4시\n· 검진 당일 아침 식사는 하지 마십시오.", "검진 당일 아침에 해야 할 일은?", "식사를 하지 않는다", ["식사를 충분히 한다", "커피를 많이 마신다", "학생회관 2층으로 간다", "3월 15일에 방문한다"]),
    (B, "[셔틀버스 안내]\n· 운행: 평일만(주말·공휴일 제외)\n· 배차 간격: 20분\n· 첫차 8시, 막차 18시\n· 시험 기간에는 막차가 20시로 연장됩니다.", "시험 기간 평일의 막차 시각은?", "저녁 8시(20시)", ["오후 6시(18시)", "오후 7시(19시)", "오후 9시(21시)", "오전 8시"]),
    (B, "[약 복용 안내]\n이 약은 하루 2회, 아침과 저녁 식사 후 30분에 1정씩 드십시오. 한 번에 2정 이상 먹지 마십시오.", "이 약을 하루에 먹는 양은 모두 몇 정입니까?", "2정", ["1정", "3정", "4정", "6정"]),
    (S, "[장학금 신청 안내]\n· 신청 기간: 4월 1일(월)~4월 5일(금) 17시\n· 제출 서류: 신청서, 성적증명서, 통장 사본\n· 접수: 학과 사무실 방문 제출\n· 서류가 하나라도 빠지면 접수되지 않습니다.", "접수가 되는 학생은?", "4월 5일 16시에 세 서류를 모두 학과 사무실에 낸 학생", ["4월 5일 18시에 세 서류를 모두 낸 학생", "신청서와 성적증명서만 낸 학생", "이메일로 세 서류를 보낸 학생", "4월 8일에 세 서류를 낸 학생"])])

# =============================================================== 국어 B
KOR["B"] = passage(
    "오랫동안 같은 자세로 앉아 있으면 어깨와 허리에 피로가 쌓인다. 이때 간단한 스트레칭을 하면 굳은 근육이 풀리고 피가 잘 돈다. 스트레칭은 한 동작을 20~30초 동안 천천히 유지하는 것이 좋다. 반동을 주어 빠르게 움직이면 오히려 근육을 다칠 수 있다. 따라서 숨을 편하게 쉬면서 아프지 않을 정도까지만 늘려야 한다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "올바른 스트레칭은 피로를 풀어 준다", ["오래 앉아 있는 것이 건강에 좋다", "스트레칭은 빠를수록 좋다", "허리 운동은 하지 않아도 된다", "아픈 것을 참고 늘려야 한다"]),
     (B, "스트레칭에서 한 동작을 유지하는 시간으로 알맞은 것은?", "20~30초", ["2~3초", "5초", "1분 30초", "5분"]),
     (B, "반동을 주어 빠르게 움직이면 어떻게 될 수 있습니까?", "근육을 다칠 수 있다", ["피로가 더 빨리 풀린다", "피가 잘 돈다", "숨쉬기가 편해진다", "키가 커진다"]),
     (B, "'유지'의 뜻으로 알맞은 것은?", "어떤 상태를 그대로 이어 가는 것", ["다른 모양으로 바꾸는 것", "잠시 멈추는 것", "빨리 끝내는 것", "처음 시작하는 것"]),
     (S, "이 글의 내용과 " + NK, "스트레칭은 반동을 주어 빠르게 해야 효과가 좋다", ["같은 자세로 오래 앉으면 어깨가 피로해진다", "스트레칭을 하면 굳은 근육이 풀린다", "숨을 편하게 쉬면서 늘려야 한다", "아프지 않을 정도까지만 늘려야 한다"])]
) + passage(
    "휴대전화 화면을 오래 보면 눈이 쉽게 마르고 피로해진다. 화면을 볼 때는 눈을 깜빡이는 횟수가 평소보다 줄어들기 때문이다. 눈의 피로를 줄이려면 20분마다 20초 동안 먼 곳을 바라보는 것이 좋다. 어두운 곳에서 화면을 보는 것도 눈에 부담을 준다. 그래서 주변이 너무 어둡지 않은지 확인하고 사용해야 한다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "휴대전화를 볼 때 눈 건강을 지키는 방법", ["휴대전화를 만드는 방법", "눈 검사를 받는 방법", "화면을 크게 키우는 방법", "휴대전화 요금을 아끼는 방법"]),
     (B, "눈의 피로를 줄이는 방법으로 글에 나온 것은?", "20분마다 20초 동안 먼 곳을 바라본다", ["1시간마다 1분 동안 눈을 감는다", "10분마다 10초 동안 가까운 곳을 본다", "하루에 한 번 20분 동안 눈을 감는다", "화면 밝기를 가장 어둡게 한다"]),
     (B, "화면을 오래 볼 때 눈이 마르는 까닭은?", "눈을 깜빡이는 횟수가 줄어들기 때문이다", ["화면이 너무 크기 때문이다", "소리가 크기 때문이다", "배터리가 부족하기 때문이다", "글자가 작기 때문이다"]),
     (S, "먼 곳을 바라보라고 하는 까닭으로 알맞은 것은?", "눈이 쉴 수 있게 하기 위해서이다", ["화면을 더 크게 보기 위해서이다", "눈을 깜빡이지 않기 위해서이다", "주변을 어둡게 하기 위해서이다", "시력을 검사하기 위해서이다"]),
     (H, "이 글을 바탕으로 눈 건강에 도움이 되는 행동이 <u>아닌</u> 것은?", "불을 끈 방에서 화면을 계속 본다", ["20분마다 먼 곳을 바라본다", "주변이 어둡지 않은지 확인한다", "눈을 자주 깜빡인다", "화면을 보는 중간에 쉰다"])]
) + notices([
    (B, "[강의실 사용 안내]\n· 사용 시간: 평일 9시~20시\n· 사용 전 학과 사무실에 예약해야 합니다.\n· 사용 후 책상을 정리하고 전등을 끄십시오.", "강의실을 사용한 뒤 해야 할 일은?", "책상을 정리하고 전등을 끈다", ["사무실에 예약을 취소한다", "칠판에 이름을 적어 둔다", "문을 열어 둔다", "전등을 켜 둔다"]),
    (B, "[수강 정정 안내]\n· 정정 기간: 3월 11일(월)~3월 12일(화)\n· 정정은 학교 홈페이지에서만 할 수 있습니다.\n· 정정 기간이 지나면 수강 과목을 바꿀 수 없습니다.", "3월 13일에 수강 과목을 바꾸려는 학생에게 알맞은 설명은?", "정정 기간이 지나서 바꿀 수 없다", ["학과 사무실에 가면 바꿀 수 있다", "홈페이지에서 바꿀 수 있다", "3월 14일까지 바꿀 수 있다", "전화로 바꿀 수 있다"]),
    (B, "[동아리 모집 안내]\n· 모집 대상: 신입생\n· 신청 방법: 학생회관 2층 게시판의 QR코드\n· 신청 기간: 3월 4일~3월 8일\n· 면접은 3월 11일에 있습니다.", "면접을 보는 날은?", "3월 11일", ["3월 4일", "3월 8일", "3월 12일", "3월 15일"]),
    (B, "[약 복용 안내]\n이 약은 하루 3회, 식사 후에 1회 2정씩 드십시오. 먹은 뒤에 졸릴 수 있으니 운전하지 마십시오.", "이 약을 하루에 먹는 양은 모두 몇 정입니까?", "6정", ["2정", "3정", "5정", "8정"]),
    (S, "[실습 복장 안내]\n· 실습복과 실습화를 착용합니다.\n· 긴 머리는 묶고, 반지와 팔찌는 하지 않습니다.\n· 손톱은 짧게 자릅니다.\n· 복장이 맞지 않으면 실습에 참여할 수 없습니다.", "실습에 참여할 수 있는 학생은?", "실습복을 입고 머리를 묶었으며 손톱이 짧은 학생", ["반지를 낀 학생", "긴 머리를 풀고 온 학생", "손톱을 길게 기른 학생", "평상복을 입고 온 학생"])])

# =============================================================== 국어 C
KOR["C"] = passage(
    "시간 관리를 잘하려면 먼저 해야 할 일을 모두 적어 보아야 한다. 그다음 급한 일과 중요한 일을 나누어 순서를 정한다. 급하지는 않아도 중요한 일을 미리 해 두면 마지막에 쫓기지 않는다. 하루를 마칠 때 계획을 얼마나 지켰는지 점검하는 것도 도움이 된다. 이런 습관이 쌓이면 시간을 더 효율적으로 쓸 수 있다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "할 일을 적고 순서를 정하면 시간을 잘 관리할 수 있다", ["시간 관리는 하지 않는 것이 편하다", "급한 일만 먼저 하면 된다", "계획은 세우지 않아도 된다", "하루에 한 가지 일만 해야 한다"]),
     (B, "시간 관리를 위해 가장 먼저 해야 할 일은?", "해야 할 일을 모두 적는다", ["계획을 점검한다", "급한 일부터 시작한다", "중요한 일을 미룬다", "일을 줄인다"]),
     (B, "급하지 않아도 중요한 일을 미리 해 두면 좋은 점은?", "마지막에 쫓기지 않는다", ["일이 더 많아진다", "계획을 세우지 않아도 된다", "급한 일이 사라진다", "점검할 필요가 없어진다"]),
     (B, "'점검'의 뜻으로 알맞은 것은?", "하나하나 살펴보는 것", ["새로 만드는 것", "뒤로 미루는 것", "내다 버리는 것", "빌려 주는 것"]),
     (S, "이 글의 내용과 " + NK, "급한 일만 먼저 하는 것이 가장 좋은 방법이다", ["할 일을 먼저 적어 보아야 한다", "급한 일과 중요한 일을 나누어 순서를 정한다", "하루를 마칠 때 계획을 점검하면 도움이 된다", "습관이 쌓이면 시간을 효율적으로 쓸 수 있다"])]
) + passage(
    "채소는 종류에 따라 보관 방법이 다르다. 감자와 양파는 서늘하고 어두운 곳에 두면 오래 보관할 수 있다. 반면 상추와 시금치 같은 잎채소는 시들기 쉬워 냉장고에 넣어야 한다. 잎채소는 물기가 있으면 쉽게 상하므로 키친타월로 감싸서 보관하는 것이 좋다. 보관 방법만 알아도 음식물 쓰레기를 줄일 수 있다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "채소는 종류에 맞게 보관해야 오래 둘 수 있다", ["모든 채소는 냉장고에 넣어야 한다", "채소는 사 오는 즉시 먹어야 한다", "감자는 먹지 않는 것이 좋다", "음식물 쓰레기는 어쩔 수 없다"]),
     (B, "감자와 양파의 알맞은 보관 장소는?", "서늘하고 어두운 곳", ["따뜻하고 밝은 곳", "냉동실", "햇빛이 드는 창가", "물이 담긴 그릇 안"]),
     (B, "잎채소를 보관하는 알맞은 방법은?", "키친타월로 감싸서 냉장고에 넣는다", ["물에 담가 실온에 둔다", "서늘한 베란다에 둔다", "비닐봉지째 햇빛에 둔다", "냉동실에 얼린다"]),
     (S, "잎채소를 키친타월로 감싸는 까닭으로 알맞은 것은?", "물기 때문에 쉽게 상하는 것을 막기 위해서이다", ["색을 예쁘게 하기 위해서이다", "맛을 달게 하기 위해서이다", "무게를 늘리기 위해서이다", "냄새를 없애기 위해서이다"]),
     (H, "이 글의 내용과 " + NK, "잎채소는 물기가 있는 채로 보관하는 것이 좋다", ["채소마다 보관 방법이 다르다", "양파는 서늘하고 어두운 곳에 두면 오래 간다", "상추는 시들기 쉬워 냉장 보관한다", "보관 방법을 알면 음식물 쓰레기를 줄일 수 있다"])]
) + notices([
    (B, "[분실물 안내]\n· 분실물 센터: 학생회관 1층\n· 운영 시간: 평일 10시~16시\n· 보관 기간: 습득일부터 30일\n· 찾을 때는 신분증을 가져오십시오.", "분실물을 찾으러 갈 때 가져가야 할 것은?", "신분증", ["학생회비 영수증", "지갑", "교재", "우산"]),
    (B, "[현장 실습 안내]\n· 일시: 5월 20일(월) 오전 9시\n· 장소: 학교 정문 앞 버스 정류장\n· 준비물: 실습복, 학생증, 필기도구\n· 지각하면 버스를 탈 수 없습니다.", "학생들이 모이는 장소는?", "학교 정문 앞 버스 정류장", ["학생회관 1층", "도서관 앞", "실습실", "기숙사 앞"]),
    (B, "[도서 연체 안내]\n· 대출 기간: 14일\n· 연체하면 책 한 권당 하루 100원의 연체료를 냅니다.\n· 연체료는 도서관 창구에서 낼 수 있습니다.", "책 한 권을 3일 연체했을 때 내야 하는 연체료는?", "300원", ["100원", "200원", "400원", "1,400원"]),
    (B, "[약 복용 안내]\n이 약은 하루 3회, 식후 30분에 1정씩 드십시오. 먹는 것을 잊었다면 다음 시간에 두 배로 먹지 말고 원래 양만 드십시오.", "약 먹는 것을 잊었을 때 알맞은 행동은?", "다음 시간에 원래 양만 먹는다", ["다음 시간에 두 배로 먹는다", "남은 약을 한꺼번에 먹는다", "약을 먹지 않는다", "다음 날에 두 배로 먹는다"]),
    (S, "[시험 안내]\n· 시험 시작: 오후 2시\n· 입실 마감: 시험 시작 10분 전\n· 시험 시간: 50분\n· 시험 종료 20분 전부터는 퇴실할 수 없습니다.", "시험이 끝나는 시각은?", "오후 2시 50분", ["오후 1시 50분", "오후 2시 30분", "오후 3시", "오후 3시 10분"])])

# =============================================================== 국어 D
KOR["D"] = passage(
    "책을 읽으면 어휘가 늘고 글을 이해하는 힘이 자란다. 특히 다양한 종류의 글을 읽으면 생각하는 폭도 넓어진다. 하루에 10분이라도 꾸준히 읽는 것이 한꺼번에 오래 읽는 것보다 습관을 만드는 데 유리하다. 처음에는 관심 있는 주제의 짧은 글부터 시작하면 부담이 적다. 읽은 뒤 한 줄이라도 느낀 점을 적어 두면 기억에 더 오래 남는다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "꾸준한 독서는 이해력과 생각의 폭을 키운다", ["독서는 시간이 남을 때만 해야 한다", "긴 글만 읽어야 한다", "책은 한 번에 끝까지 읽어야 한다", "읽은 내용은 적지 않는 것이 좋다"]),
     (B, "독서 습관을 만드는 데 유리한 방법은?", "하루에 10분이라도 꾸준히 읽는다", ["주말에 하루 종일 읽는다", "한 달에 한 번 몰아서 읽는다", "어려운 책부터 읽는다", "한 권만 계속 읽는다"]),
     (B, "처음에 관심 있는 주제의 짧은 글부터 읽으라고 하는 까닭은?", "부담이 적기 때문이다", ["책값이 싸기 때문이다", "글씨가 크기 때문이다", "시간이 오래 걸리기 때문이다", "어휘가 줄기 때문이다"]),
     (B, "'꾸준히'의 뜻으로 알맞은 것은?", "쉬지 않고 계속하여", ["생각날 때마다 가끔", "아주 빠르게", "한꺼번에 몰아서", "조용히 혼자서"]),
     (S, "이 글의 내용과 " + NK, "한꺼번에 오래 읽는 것이 습관을 만드는 데 가장 유리하다", ["책을 읽으면 어휘가 늘어난다", "다양한 글을 읽으면 생각하는 폭이 넓어진다", "느낀 점을 적어 두면 기억에 오래 남는다", "관심 있는 주제의 짧은 글부터 시작하면 좋다"])]
) + passage(
    "우리나라는 물이 풍부한 것 같지만 실제로는 물 부족 국가로 분류된다. 비가 오는 시기가 여름에 몰려 있어 대부분의 물이 바다로 흘러가 버리기 때문이다. 양치할 때 컵을 사용하면 물을 많이 아낄 수 있다. 샤워 시간을 줄이는 것도 좋은 방법이다. 작은 실천이 모이면 큰 절약이 된다.",
    [(B, "이 글의 중심 내용으로 알맞은 것은?", "물이 부족하므로 일상에서 물을 아껴야 한다", ["물은 아무리 써도 남는다", "여름에는 물을 더 써야 한다", "비는 모두 바다로 보내야 한다", "샤워는 하지 않는 것이 좋다"]),
     (B, "우리나라가 물 부족 국가로 분류되는 까닭은?", "비가 여름에 몰려 대부분의 물이 바다로 흘러가기 때문이다", ["비가 한 번도 오지 않기 때문이다", "강이 하나도 없기 때문이다", "물을 쓰지 않기 때문이다", "바다가 없기 때문이다"]),
     (B, "양치할 때 물을 아끼는 방법은?", "컵을 사용한다", ["물을 계속 틀어 둔다", "양치를 길게 한다", "샤워하면서 양치한다", "컵 없이 입을 헹군다"]),
     (S, "'작은 실천이 모이면 큰 절약이 된다'는 말의 뜻으로 알맞은 것은?", "사소해 보여도 모두 실천하면 효과가 크다", ["작은 물건은 아끼지 않아도 된다", "한 사람의 실천은 소용이 없다", "큰 실천만 의미가 있다", "물을 아끼면 돈이 많이 든다"]),
     (H, "이 글의 내용과 " + NK, "우리나라는 비가 일 년 내내 고르게 내려 물이 넉넉하다", ["물이 풍부한 것 같지만 물 부족 국가로 분류된다", "비가 여름에 몰려 있다", "양치할 때 컵을 쓰면 물을 아낄 수 있다", "샤워 시간을 줄이는 것도 도움이 된다"])]
) + notices([
    (B, "[기숙사 안내]\n· 통금 시간: 밤 11시\n· 외박은 하루 전까지 사감실에 신청\n· 요리는 1층 공동 주방에서만 가능", "안내문의 내용과 같은 것은?", "요리는 1층 공동 주방에서만 할 수 있다", ["통금 시간은 밤 12시이다", "외박은 당일에 신청한다", "방 안에서 요리해도 된다", "외박은 신청하지 않아도 된다"]),
    (B, "[수강 신청 안내]\n· 신청 기간: 2월 20일(화) 오전 10시~2월 22일(목) 오후 5시\n· 한 학기에 최대 21학점까지 신청할 수 있습니다.", "수강 신청이 끝나는 시각은?", "2월 22일 오후 5시", ["2월 20일 오전 10시", "2월 21일 오후 5시", "2월 22일 오전 10시", "2월 23일 오후 5시"]),
    (B, "[학생증 재발급 안내]\n· 신청: 학생지원처 방문\n· 수수료: 5,000원\n· 사진 1장을 가져오십시오.\n· 발급까지 3일이 걸립니다.", "월요일에 신청하면 학생증을 받을 수 있는 요일은?", "목요일", ["화요일", "수요일", "금요일", "다음 주 월요일"]),
    (B, "[약 복용 안내]\n이 약은 하루 2회, 1회에 1정을 물과 함께 드십시오. 우유나 주스와 함께 먹으면 효과가 떨어질 수 있습니다.", "이 약을 먹을 때 알맞은 음료는?", "물", ["우유", "주스", "우유와 주스를 섞은 것", "탄산음료"]),
    (S, "[행사 안내]\n· 일시: 10월 7일(월) 14시~16시\n· 장소: 대강당\n· 사전 신청자에게 기념품을 드립니다.\n· 사전 신청은 10월 4일(금)까지입니다.", "기념품을 받을 수 있는 학생은?", "10월 3일에 사전 신청한 학생", ["10월 5일에 신청한 학생", "신청 없이 행사 당일에 온 학생", "10월 8일에 신청한 학생", "신청도 행사 참석도 하지 않은 학생"])])

# =============================================================== 영어 A
ENG["A"] = passage(
    "Mina wakes up at seven every morning. She washes her face and eats breakfast. Then she walks to school with her friend, Jisu. They arrive at school at eight thirty. After school, Mina goes to the library to study.",
    [(B, "What time does Mina wake up?", "At seven", ["At five", "At six", "At eight", "At nine"]),
     (B, "How does Mina go to school?", "She walks", ["By bus", "By bike", "By subway", "By car"]),
     (B, "Who goes to school with Mina?", "Her friend", ["Her mother", "Her sister", "Her teacher", "Nobody"]),
     (B, "Where does Mina go after school?", "To the library", ["To the park", "To the mall", "To the gym", "To the cafeteria"]),
     (S, "Which is <u>NOT</u> true?", "Mina arrives at school at nine", ["Mina wakes up at seven", "Mina eats breakfast", "Mina goes to school with Jisu", "Mina studies at the library after school"])]
) + passage(
    "Many people drink coffee in the morning. Coffee has caffeine, and caffeine helps people feel awake. However, too much caffeine can make it hard to sleep at night. Doctors say adults should not drink more than four cups a day. Drinking water or tea in the afternoon is a good way to sleep better.",
    [(B, "What is the main idea of the text?", "Coffee can help us feel awake, but too much is not good", ["Coffee is the best drink for everyone", "Doctors never drink coffee", "Tea is bad for sleep", "Water is more expensive than coffee"]),
     (B, "What does caffeine do?", "It helps people feel awake", ["It makes people hungry", "It makes people sleepy", "It makes people taller", "It makes people cold"]),
     (B, "How many cups of coffee a day should adults NOT go over?", "Four", ["One", "Two", "Six", "Ten"]),
     (S, "What may happen if we drink too much caffeine?", "We may have trouble sleeping", ["We will get taller", "We will feel hungry all day", "We will sleep better", "We will forget our names"]),
     (H, "Which is <u>NOT</u> true?", "Doctors say adults should drink six cups of coffee a day", ["Many people drink coffee in the morning", "Caffeine helps people feel awake", "Too much caffeine can cause sleep problems", "Water or tea in the afternoon can help us sleep"])]
) + notices([
    (B, "[Notice]\nThe cafeteria is open from 11 a.m. to 2 p.m. on weekdays. It is closed on weekends and holidays.", "When is the cafeteria closed?", "On weekends", ["On Monday", "On Tuesday", "On Friday", "At 1 p.m."]),
    (B, "[Medicine]\nTake two tablets after each meal. Take the medicine three times a day.", "How many tablets should you take in a day?", "Six", ["Two", "Three", "Five", "Eight"]),
    (B, "[Library Rule]\nPlease keep quiet in the library. You can borrow up to five books for two weeks.", "How many books can you borrow?", "Five", ["Two", "Three", "Ten", "Fourteen"]),
    (B, "[Shuttle Bus]\nThe bus leaves every 20 minutes. The first bus is at 8:00 a.m. and the last bus is at 6:00 p.m.", "What time is the last bus?", "6:00 p.m.", ["8:00 a.m.", "8:20 a.m.", "5:40 p.m.", "8:00 p.m."]),
    (S, "[Report]\nHand in your report by Friday, May 10. Late reports lose 10 points for each day.", "A student hands in the report on Sunday, May 12. How many points does the student lose?", "20 points", ["10 points", "30 points", "40 points", "50 points"])])

# =============================================================== 영어 B
ENG["B"] = passage(
    "Tom has a dog named Max. Every evening, Tom takes Max for a walk in the park. They walk for thirty minutes. Max likes to run and play with other dogs. After the walk, Tom gives Max some water and food.",
    [(B, "What is the dog's name?", "Max", ["Tom", "Jisu", "Bob", "Leo"]),
     (B, "When does Tom walk Max?", "Every evening", ["Every morning", "Every afternoon", "On weekends only", "Once a month"]),
     (B, "How long do they walk?", "For thirty minutes", ["For ten minutes", "For twenty minutes", "For one hour", "For two hours"]),
     (B, "What does Max like to do?", "Run and play with other dogs", ["Sleep all day", "Watch TV", "Swim in the sea", "Cook dinner"]),
     (S, "Which is <u>NOT</u> true?", "Tom walks Max in the school yard", ["Tom has a dog", "Tom walks Max every evening", "They walk for thirty minutes", "Tom gives Max water and food after the walk"])]
) + passage(
    "Recycling helps protect the environment. When we recycle paper, plastic, and glass, we can make new products from old ones. This saves energy and reduces trash. Before recycling, we should wash plastic bottles and remove their labels. Recycling is a small habit that makes a big difference.",
    [(B, "What is the main idea of the text?", "Recycling is a good habit that protects the environment", ["Plastic is better than paper", "Trash is useful for cooking", "New products are always bad", "We should not wash bottles"]),
     (B, "What can we recycle?", "Paper, plastic, and glass", ["Only paper", "Only glass", "Food and water", "Nothing"]),
     (B, "What should we do before recycling plastic bottles?", "Wash them and remove the labels", ["Break them into pieces", "Fill them with water", "Paint them", "Keep them for a year"]),
     (S, "The word 'reduces' is closest in meaning to ______.", "makes less", ["makes bigger", "keeps the same", "makes colorful", "makes noisy"]),
     (H, "Which is <u>NOT</u> true?", "Recycling uses more energy and makes more trash", ["Recycling helps the environment", "We can make new products from old ones", "Recycling saves energy", "Washing bottles is a good first step"])]
) + notices([
    (B, "[Notice]\nThe gym is open from 6 a.m. to 10 p.m. every day. Please wear sports shoes.", "What must you wear in the gym?", "Sports shoes", ["A hat", "A uniform", "Gloves", "Sandals"]),
    (B, "[Medicine]\nDo not take this medicine on an empty stomach. Take it after a meal with a glass of water.", "When should you take this medicine?", "After a meal", ["Before a meal", "On an empty stomach", "Before bed only", "Without water"]),
    (B, "[Test Rules]\nPlease turn off your cell phone. You may not talk to other students during the test.", "What should you <u>NOT</u> do during the test?", "Talk to other students", ["Turn off your cell phone", "Sit quietly", "Bring a pen", "Read the questions"]),
    (B, "[Lab Rule]\nPlease wear a lab coat and safety glasses in the lab. Do not eat or drink in the lab.", "What is <u>NOT</u> allowed in the lab?", "Eating and drinking", ["Wearing a lab coat", "Wearing safety glasses", "Working with a partner", "Asking a question"]),
    (S, "[Class Notice]\nClass starts at 9:00 a.m. Students who arrive after 9:10 a.m. cannot enter the classroom.", "Which student can enter the classroom?", "A student who arrives at 9:05", ["A student who arrives at 9:11", "A student who arrives at 9:15", "A student who arrives at 9:30", "A student who arrives at 10:00"])])

# =============================================================== 영어 C
ENG["C"] = passage(
    "Sora is a college student. She has a part-time job at a café on weekends. She works from ten in the morning to four in the afternoon. With the money she earns, she buys books and pays for her phone bill. She says the job also teaches her how to talk politely to customers.",
    [(B, "Where does Sora work?", "At a café", ["At a library", "At a hospital", "At a bookstore", "At a school"]),
     (B, "When does Sora work?", "On weekends", ["Every weekday", "Only on Mondays", "Every night", "Once a month"]),
     (B, "How many hours does Sora work in one day?", "Six hours", ["Four hours", "Five hours", "Seven hours", "Eight hours"]),
     (B, "What does Sora do with the money she earns?", "She buys books and pays her phone bill", ["She buys a car", "She travels abroad", "She gives it to her friends", "She buys clothes only"]),
     (S, "Which is <u>NOT</u> true?", "Sora works at the café every day", ["Sora is a college student", "Sora works on weekends", "Sora works from ten to four", "Sora learns to talk politely to customers"])]
) + passage(
    "Sleep is important for students. When we sleep, our brain keeps what we learned during the day. Students who sleep less than six hours often find it hard to focus in class. Experts say young adults need about eight hours of sleep. Going to bed at the same time every night can help.",
    [(B, "What is the main idea of the text?", "Enough sleep helps students learn and focus", ["Students should never sleep", "Classes should start earlier", "Eight hours is too long to sleep", "Brains do not need rest"]),
     (B, "Why is sleep important for students?", "The brain keeps what we learned during the day", ["It makes classes shorter", "It makes homework easier", "It helps students grow taller", "It makes the brain smaller"]),
     (B, "How many hours of sleep do young adults need?", "About eight hours", ["About two hours", "About four hours", "About six hours", "About twelve hours"]),
     (S, "What often happens to students who sleep less than six hours?", "They find it hard to focus in class", ["They get better grades", "They feel more awake", "They learn faster", "They never feel tired"]),
     (H, "Which is <u>NOT</u> true?", "Going to bed at different times every night helps us sleep better", ["Sleep is important for students", "Experts say young adults need about eight hours", "The brain keeps what we learned while we sleep", "Going to bed at the same time can help"])]
) + notices([
    (B, "[Parking]\nStudents may park in Lot B only. Cars in other lots will be moved.", "Where can students park?", "In Lot B", ["In Lot A", "In Lot C", "Next to the gym", "In any lot"]),
    (B, "[Medicine]\nKeep this medicine in a cool, dry place. Do not keep it in the bathroom.", "Where should you keep this medicine?", "In a cool, dry place", ["In the bathroom", "In a hot car", "In the sun", "In a glass of water"]),
    (B, "[Notice]\nThe school festival is on October 20. It starts at 10 a.m. and ends at 5 p.m.", "When does the festival end?", "At 5 p.m.", ["At 10 a.m.", "At 12 p.m.", "At 3 p.m.", "At 7 p.m."]),
    (B, "[Library Card]\nBring your student ID to get a library card. The card is free.", "What do you need to get a library card?", "Your student ID", ["Money", "A photo of a book", "A letter from a teacher", "A bank card"]),
    (S, "[Event]\nSign up by Wednesday. The event is free for students. Other people must pay 5,000 won.", "A visitor who is not a student wants to join the event. How much must the visitor pay?", "5,000 won", ["0 won", "1,000 won", "10,000 won", "50,000 won"])])

# =============================================================== 영어 D
ENG["D"] = passage(
    "James is learning to cook. He started a cooking class last month. In the class, he learned how to make soup and fried rice. Last weekend, he cooked dinner for his family. His mother said it was delicious.",
    [(B, "What is James learning?", "To cook", ["To dance", "To swim", "To draw", "To play the guitar"]),
     (B, "When did James start the class?", "Last month", ["Last week", "Last year", "Yesterday", "Two years ago"]),
     (B, "What did James learn to make?", "Soup and fried rice", ["Pizza and bread", "Cake and cookies", "Salad and pasta", "Coffee and tea"]),
     (B, "Who did James cook dinner for?", "His family", ["His teacher", "His friends", "His classmates", "A restaurant"]),
     (S, "Which is <u>NOT</u> true?", "James's mother did not like the dinner", ["James is learning to cook", "James started a cooking class last month", "James cooked dinner last weekend", "James learned how to make soup"])]
) + passage(
    "Exercise is good for both the body and the mind. People who exercise regularly have stronger muscles and a healthier heart. Exercise also reduces stress and helps us feel happy. You do not need special equipment. Walking for thirty minutes a day is a good start.",
    [(B, "What is the main idea of the text?", "Regular exercise is good for the body and the mind", ["Exercise is only for athletes", "Special equipment is necessary", "Stress is good for the heart", "Walking is bad for muscles"]),
     (B, "What can exercise do for our mind?", "It reduces stress and helps us feel happy", ["It makes us forget everything", "It makes us feel angry", "It makes us feel more stress", "It makes us sleepy all day"]),
     (B, "Do we need special equipment to exercise?", "No, we do not", ["Yes, we always do", "Yes, we need a gym", "Yes, we need a coach", "Yes, we need a bicycle"]),
     (S, "What is a good way to start exercising?", "Walking for thirty minutes a day", ["Running for five hours a day", "Lifting heavy weights every day", "Sitting for thirty minutes a day", "Sleeping for thirty minutes a day"]),
     (H, "Which is <u>NOT</u> true?", "We must buy special equipment to exercise", ["Exercise is good for the body and the mind", "Regular exercise makes muscles stronger", "Exercise reduces stress", "Walking is a good start"])]
) + notices([
    (B, "[Notice]\nThe pool is closed on Mondays. It is open from Tuesday to Sunday.", "On which day is the pool closed?", "Monday", ["Tuesday", "Wednesday", "Saturday", "Sunday"]),
    (B, "[Medicine]\nTake one tablet in the morning and one at night. Do not take more than two tablets a day.", "How many tablets should you take in a day?", "Two", ["One", "Three", "Four", "Six"]),
    (B, "[Rule]\nPlease throw your trash in the correct bin. Put plastic bottles in the blue bin.", "Where should you put plastic bottles?", "In the blue bin", ["In the red bin", "In the green bin", "In the yellow bin", "In any bin"]),
    (B, "[Exam]\nBring your ID card and a pen. You cannot use a dictionary.", "What do you need to bring to the exam?", "An ID card and a pen", ["A dictionary and a pen", "An ID card and a dictionary", "A pen and a calculator", "A phone and an ID card"]),
    (S, "[Bus]\nThe bus to the airport leaves at 7:30 a.m. Please arrive 15 minutes before it leaves.", "What time should you arrive?", "7:15 a.m.", ["7:00 a.m.", "7:30 a.m.", "7:45 a.m.", "8:15 a.m."])])

# =============================================================== 검증 · 정답 위치 균등화
SUBJ = {"kor": ("국어", "KR", KOR), "eng": ("영어", "EN", ENG)}
rng = random.Random(2027)
bank = {}


def sentences(t):
    return len([x for x in re.split(r"(?<=[.?!])\s+", t.strip()) if x])


for k, (kname, pre, forms) in SUBJ.items():
    allitems = []
    for f in "ABCD":
        L = forms[f]
        assert len(L) == 15, (k, f, len(L))
        assert Counter(i["d"] for i in L) == {RD: 10, IN: 5}, (k, f)
        assert Counter(i["lv"] for i in L) == {B: 11, S: 3, H: 1}, (k, f, Counter(i["lv"] for i in L))
        for i in L[:10]:
            assert sentences(i["c"]) <= 5, (k, f, "지문 5문장 초과", i["c"])
        for i in L[10:]:
            assert i["c"].startswith("["), (k, f)
        allitems += L
    # 같은 지문·문제 반복 금지
    keys = [(i["c"], i["q"]) for i in allitems]
    assert len(set(keys)) == 60, k
    # 균등 배치: 정답 위치 ①~⑤ 12개씩
    targets = [p for p in range(5) for _ in range(12)]
    rng.shuffle(targets)
    for i, t in zip(allitems, targets):
        others = i["o"][1:]
        rng.shuffle(others)
        others.insert(t, i["key"])
        i["o"], i["a"] = others, t
        assert i["o"][i["a"]] == i["key"] and len(set(i["o"])) == 5
    bank[k] = []
    for f in "ABCD":
        for n, i in enumerate(forms[f], 1):
            bank[k].append(dict(id=f"{pre}-{f}{n:02d}", form=f, no=n, d=i["d"], lv=i["lv"], c=i["c"], q=i["q"], o=i["o"], a=i["a"]))

with open(f"{OUT}/items_lang.js", "w", encoding="utf-8") as fp:
    fp.write("// 국어·영어 문항은행(과목당 4세트×15문항, 전 학과 공통). tools/gen_lang_bank.py로 생성·검증됨 — 직접 수정하지 말고 생성기를 수정하세요.\n")
    fp.write("window.LANG_BANK=" + json.dumps(bank, ensure_ascii=False, indent=1) + ";\n")
os.makedirs(f"{OUT}/docs", exist_ok=True)
for k, (kname, pre, forms) in SUBJ.items():
    L = bank[k]
    with open(f"{OUT}/docs/{kname}_공통_60문항.csv", "w", encoding="utf-8-sig", newline="") as fp:
        w = csv.writer(fp)
        w.writerow(["문항ID", "세트", "번호", "영역", "난이도", "지문/안내문", "문제", "①", "②", "③", "④", "⑤", "정답"])
        for b in L:
            w.writerow([b["id"], b["form"], b["no"], b["d"], b["lv"], (b["c"] or "").replace("\n", " / "), b["q"], *b["o"], "①②③④⑤"[b["a"]]])
    with open(f"{OUT}/docs/{kname}_공통_60문항.md", "w", encoding="utf-8") as fp:
        fp.write(f"# {kname} 진단 문항 (공통 60문항 · 4세트)\n\n전 학과 공통. 세트당 15문항(독해 10 + 지시문 이해 5), 난이도 기초 11 + 표준 3 + 변별 1, 중2~3 수준, 20분. 독해 지문은 5문장 이내, 부정형 문제는 밑줄 표시. ※ 검수 전 초안입니다.\n\n")
        fp.write("## 세트 구성 기준\n\n| 번호 | 영역 | 난이도 |\n|---|---|---|\n")
        for b in [x for x in L if x["form"] == "A"]:
            fp.write(f"| {b['no']} | {b['d']} | {b['lv']} |\n")
        for f in "ABCD":
            fp.write(f"\n## 세트 {f}\n\n")
            last = None
            for b in [x for x in L if x["form"] == f]:
                if b["c"] != last:
                    fp.write("> " + b["c"].replace("\n", "  \n> ") + "\n\n")
                    last = b["c"]
                fp.write(f"**{b['no']}.** [{b['d']}·{b['lv']}] {b['q']}\n\n")
                fp.write("  ".join(f"{'①②③④⑤'[j]} {o}" for j, o in enumerate(b["o"])) + "\n\n")
        fp.write("\n## 정답표\n\n| 세트 | " + " | ".join(str(n) for n in range(1, 16)) + " |\n|---|" + "---|" * 15 + "\n")
        for f in "ABCD":
            fp.write(f"| {f} | " + " | ".join("①②③④⑤"[b["a"]] for b in L if b["form"] == f) + " |\n")
    dist = Counter(b["a"] for b in L)
    print(kname, "OK 60문항, 정답 위치:", {"①②③④⑤"[x]: dist[x] for x in range(5)})
