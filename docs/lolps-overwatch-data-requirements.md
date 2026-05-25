# LOL.PS 벤치마크 기반 오버워치 데이터 요구사항

조사일: 2026-05-25 KST  
대상: https://lol.ps/ 공개 화면, 공개 API 호출, 오버워치 공식/비공식 데이터 접근 가능성

## 목적

`lol.ps`와 유사한 메타/전적 분석 서비스를 오버워치 전용으로 만들기 위해, 화면별로 필요한 데이터와 백엔드 집계 단위를 정리한다.

이 문서는 UI 기획서가 아니라 데이터 요구사항 문서다. 각 화면이 사용자에게 보여주는 값과 그 값을 만들기 위해 필요한 원천/집계 데이터를 분리해 정의한다.

## 핵심 결론

LOL.PS는 크게 다음 4개 축으로 구성된다.

- 메타 랭킹: 챔피언 티어, 승률, 픽률, 밴율, 순위 변동
- 상세 분석: 카운터, 시너지, 빌드, 룬, 스킬, 시간대별 성능
- 플레이어 분석: 랭킹, 전적, 최근 경기, 모스트 챔피언, 랭크 추이
- 프리미엄 분석: 데이터 스튜디오, 매치업 심층 지표, 조합별 비교

오버워치에서는 LoL의 `라인/룬/스펠/아이템` 축을 그대로 옮기면 안 된다. 다음 축으로 치환하는 것이 맞다.

- `라인` -> `역할`: Tank, Damage, Support
- `챔피언` -> `히어로`
- `룬/스펠` -> `Perk`, 영웅 특성/선택지
- `아이템/코어템` -> 기본 경쟁전에는 없음. Stadium 모드가 별도 핵심 축
- `상대 챔피언` -> 히어로 매치업, 조합 매치업, 역할별 상대 성능
- `바텀 듀오` -> 2인/3인/5인 조합, Tank-DPS-Support 조합
- `라인전` -> 초반 교전/오브젝트/맵 구간 지표

가장 큰 리스크는 데이터 수급이다. 오버워치는 LoL처럼 공개 매치 상세/전체 메타 데이터 API가 안정적으로 제공되지 않는다. 공식적으로 공개된 범위가 제한적이며, OWAPI 같은 서비스는 비공식이다. 따라서 MVP는 “확보 가능한 데이터 기준”으로 설계를 쪼개야 한다.

## 화면별 데이터 요구사항

| 화면 | LOL.PS에서 확인한 기능 | 오버워치 전용 필요 데이터 |
| --- | --- | --- |
| 홈 | 검색, 실시간 검색어, 배너, 티어 리스트 요약 | 플레이어/히어로 검색 인덱스, 인기 검색어, 공지/배너, 히어로 티어 Top N |
| 히어로 랭킹 | 라인별 티어, PS Score, 승률, 픽률, 밴율, 게임수, 순위 변동 | 히어로별 역할, 티어 점수, 승률, 픽률, 밴율, 게임수, 랭크/지역/플랫폼/패치 필터 |
| 히어로 상세 | 역할 비중, 승/픽/밴율, 파워 커브, 카운터, 시너지, 스펠/아이템/룬/스킬 | 역할별 선택률, 맵/모드별 승률, 시간대별 성능, 카운터 히어로, 조합 시너지, Perk 선택률/승률, 밴 데이터 |
| 매치업/상대법 | 두 챔피언 비교, 라인 선택, 세부 지표, 상대법 텍스트, 프로 빌드 | 히어로 A vs B 승률, 맵/역할/랭크별 비교, 교전/데스/처치/힐/딜 지표, 운영 팁 |
| 조합/듀오 | 바텀+서폿 vs 바텀+서폿, 승률, 표본수, 세부 지표 | 2인/3인/5인 조합 승률, 탱커-딜러-서포터 조합, 미러/비미러 조합, 맵별 조합 성능 |
| 플레이어 랭킹 | 서버/라인별 랭커, LP, 승률, 게임수, 모스트 챔피언, 프로 태그 | 경쟁전 랭킹, 역할별 랭크, 승률, 게임수, 주력 히어로, 프로/스트리머 여부 |
| 플레이어 전적 | 프로필, 랭크 히스토리, 최근 경기, 모스트, 팀운/라인전/캐리력 | 플레이어 프로필, 역할별 랭크, 최근 경기, 히어로별 성과, 맵/모드별 성과, 팀원/상대 히스토리 |
| 모드 전용 | 칼바람 티어 | 경쟁전, 빠른대전, Stadium, Mystery Heroes 등 모드별 히어로 티어 |
| Data Studio | 고급 그래프, 아이템 연구, 듀오 시너지, 매치업 통계 | 히어로/맵/조합/Perk/밴/랭크 구간별 자유 필터링 |

## 공통 필터

모든 통계 화면은 같은 필터 체계를 공유해야 한다.

| 필터 | 설명 |
| --- | --- |
| 시즌/패치 | 밸런스 패치 단위. 티어와 승률은 패치별로 분리 필요 |
| 지역 | KR, NA, EU 등. 데이터 수급 범위에 따라 축소 가능 |
| 플랫폼 | PC, Console, Crossplay. 가능하면 분리 |
| 랭크 구간 | Bronze~Champion/Top 500 등 |
| 역할 | Tank, Damage, Support |
| 게임 모드 | Competitive, Quick Play, Stadium, Mystery Heroes 등 |
| 맵 | Control, Escort, Hybrid, Push, Flashpoint, Clash 등 맵/모드 구분 |
| 기간 | 최근 1일, 7일, 14일, 패치 전체 |

## 홈

### 필요한 표시 데이터

- 통합 검색창
- 인기 검색어
- 서비스 공지/프로모션 배너
- 히어로 티어 리스트 요약
- 현재 기준 패치/시즌/랭크 구간

### 필요한 집계 데이터

- 검색 대상 인덱스
  - 플레이어명
  - 배틀태그
  - 히어로명
  - 히어로 초성/별칭
- 인기 검색어
  - 검색어
  - 검색 횟수
  - 최근 순위
  - 순위 변동
- 히어로 티어 Top N
  - 히어로 ID
  - 역할
  - 티어 점수
  - 승률
  - 픽률
  - 밴율
  - 표본수

## 히어로 랭킹

### 필요한 표시 데이터

- 역할 탭: Tank, Damage, Support, 전체
- 패치/랭크/지역/플랫폼 필터
- 랭킹 테이블
  - 순위
  - 순위 변동
  - 히어로
  - 역할
  - 티어 점수
  - 승률
  - 픽률
  - 밴율
  - 게임수

### 티어 점수 계산 후보

LOL.PS는 `opScore`, `honeyScore`, `opTier`를 별도 계산한다. 오버워치에서는 다음 요소를 조합해 자체 점수를 만들 수 있다.

- 승률 z-score
- 픽률 z-score
- 밴율 z-score
- 랭크 상위권 가중치
- 맵 다양성 가중치
- 역할 내 상대 성능
- 최근 패치 이후 상승/하락 추세
- 표본수 신뢰도 보정

### 필요한 집계 테이블

`hero_stats_by_segment`

| 필드 | 설명 |
| --- | --- |
| hero_id | 히어로 ID |
| role | Tank/Damage/Support |
| season_id | 시즌 |
| patch_id | 패치 |
| region | 지역 |
| platform | 플랫폼 |
| rank_bucket | 랭크 구간 |
| mode | 게임 모드 |
| map_id | 맵. 전체 집계면 null 허용 |
| games | 표본수 |
| wins | 승리 수 |
| picks | 선택 수 |
| bans | 밴 수 |
| pick_rate | 선택률 |
| win_rate | 승률 |
| ban_rate | 밴율 |
| tier_score | 자체 티어 점수 |
| tier | S/A/B/C/D 또는 1~5 티어 |
| rank | 현재 순위 |
| rank_delta | 이전 기준 대비 순위 변동 |
| updated_at | 집계 시각 |

## 히어로 상세

### 상단 요약

필요 데이터:

- 히어로 기본 정보
  - 이름
  - 역할
  - 초상화
  - 스킬 아이콘/설명
  - 기본 체력/방어구/실드 등 정적 스탯
- 역할별 선택 비중
- 현재 필터 기준 승률/픽률/밴율/티어 점수
- 패치별 순위/점수 변화

### 통계 그래프

LOL.PS는 승률/픽률/밴율 그래프와 시간대별 기대 승률을 보여준다.

오버워치 필요 데이터:

- 날짜별 승률/픽률/밴율
- 매치 시간대별 승률
  - 0~5분
  - 5~10분
  - 10~15분
  - 15분+
- 맵 타입별 승률
- 공격/수비 라운드별 성능

`hero_trend_stats`

| 필드 | 설명 |
| --- | --- |
| hero_id | 히어로 |
| segment_key | 필터 조합 키 |
| date | 기준일 |
| games | 표본수 |
| win_rate | 승률 |
| pick_rate | 픽률 |
| ban_rate | 밴율 |
| tier_score | 티어 점수 |

### 카운터

필요 표시 데이터:

- 상대하기 어려운 히어로
- 상대하기 쉬운 히어로
- 상대 히어로별 승률
- 표본수
- 픽률
- 상대법 존재 여부

`hero_matchups`

| 필드 | 설명 |
| --- | --- |
| hero_id | 기준 히어로 |
| enemy_hero_id | 상대 히어로 |
| role | 기준 역할 |
| enemy_role | 상대 역할 |
| map_id | 맵 |
| mode | 게임 모드 |
| rank_bucket | 랭크 구간 |
| games | 표본수 |
| wins | 기준 히어로 승리 수 |
| win_rate | 기준 히어로 승률 |
| pick_rate | 해당 매치업 비중 |
| kill_diff | 처치 차이 |
| death_diff | 데스 차이 |
| damage_diff | 피해량 차이 |
| healing_diff | 치유량 차이 |
| mitigation_diff | 경감량 차이 |
| objective_diff | 오브젝트 기여 차이 |

### 시너지

LOL.PS는 탑-정글 시너지를 별도 표로 보여준다. 오버워치는 역할 조합이 핵심이다.

필요 표시 데이터:

- 히어로 A + 히어로 B 조합 승률
- 조합 픽률
- 표본수
- 각 히어로 단독 승률
- 시너지 점수

`composition_pair_stats`

| 필드 | 설명 |
| --- | --- |
| hero_id_1 | 히어로 1 |
| hero_id_2 | 히어로 2 |
| role_1 | 역할 1 |
| role_2 | 역할 2 |
| mode | 게임 모드 |
| map_id | 맵 |
| rank_bucket | 랭크 구간 |
| games | 같이 나온 게임 수 |
| wins | 같이 이긴 게임 수 |
| duo_win_rate | 조합 승률 |
| hero_1_win_rate | 히어로 1 단독 승률 |
| hero_2_win_rate | 히어로 2 단독 승률 |
| pick_rate | 조합 픽률 |
| synergy_score | 기대 승률 대비 초과/미달 점수 |

### Perk 통계

오버워치는 Season 15부터 Perks가 도입되었으므로, LoL의 룬 통계에 해당하는 핵심 화면이 될 수 있다.

필요 표시 데이터:

- 히어로별 Minor Perk 선택률/승률
- 히어로별 Major Perk 선택률/승률
- Perk 조합별 선택률/승률
- 랭크/맵/상대 조합별 Perk 성능

`hero_perk_stats`

| 필드 | 설명 |
| --- | --- |
| hero_id | 히어로 |
| perk_id | Perk |
| perk_slot | minor/major |
| patch_id | 패치 |
| rank_bucket | 랭크 |
| map_id | 맵 |
| enemy_comp_key | 상대 조합 키 |
| games | 표본수 |
| wins | 승리 수 |
| pick_rate | 선택률 |
| win_rate | 승률 |

### 스킬/능력 성능

LoL의 스킬 마스터 순서는 오버워치에 직접 대응하지 않는다. 대신 다음 데이터가 있으면 유사 분석이 가능하다.

- 궁극기 사용 횟수
- 궁극기 당 처치/어시스트/세이브
- 스킬 명중률
- 스킬당 평균 피해/치유/경감
- 주요 스킬 사용 후 킬 전환율

이 데이터는 공식 접근성이 낮으므로 MVP에서는 제외하거나, 리플레이/사용자 업로드 기반으로 별도 수집해야 한다.

## 매치업/상대법

### 필요한 표시 데이터

- 히어로 A 선택
- 히어로 B 선택
- 역할/맵/랭크/패치 필터
- A 기준 승률
- 표본수
- A/B 평균 성과 비교
  - 처치
  - 데스
  - 어시스트
  - 피해량
  - 치유량
  - 경감량
  - 궁극기 효율
  - 오브젝트 기여
- 상대법 텍스트
- 프로/상위권 경기 예시

### 필요한 테이블

`matchup_guides`

| 필드 | 설명 |
| --- | --- |
| hero_id | 기준 히어로 |
| enemy_hero_id | 상대 히어로 |
| map_id | 맵. 전체 공통이면 null |
| role | 역할 |
| title | 제목 |
| body | 상대법 본문 |
| author_type | staff/expert/community |
| author_id | 작성자 |
| patch_id | 작성 패치 |
| status | draft/published/archived |
| updated_at | 수정 시각 |

`pro_match_examples`

| 필드 | 설명 |
| --- | --- |
| match_id | 경기 ID |
| player_id | 플레이어 |
| hero_id | 플레이 히어로 |
| enemy_hero_id | 주요 상대 |
| map_id | 맵 |
| mode | 모드 |
| result | 승패 |
| duration | 경기 시간 |
| kills | 처치 |
| deaths | 데스 |
| assists | 어시스트 |
| damage | 피해량 |
| healing | 치유량 |
| mitigation | 경감 |
| rank_bucket | 랭크 |
| played_at | 플레이 시각 |

## 조합 분석

LOL.PS의 바텀 듀오는 특정 2:2 조합 비교 화면이다. 오버워치는 팀 게임 특성상 다음 3단계가 필요하다.

### MVP 조합

- 2인 조합: Tank+DPS, Tank+Support, DPS+Support, DPS+DPS, Support+Support
- 3인 조합: Tank+DPS+Support
- 역할별 인기 조합

### 확장 조합

- 5인 전체 조합
- 미러전 제외/포함 필터
- 맵별 조합 성능
- 상대 조합별 카운터
- 밴 후 조합 승률

`composition_stats`

| 필드 | 설명 |
| --- | --- |
| comp_key | 정렬된 히어로 ID 조합 키 |
| hero_ids | 히어로 ID 배열 |
| role_pattern | 예: Tank-Damage-Support |
| enemy_comp_key | 상대 조합 키. 전체 집계면 null |
| mode | 모드 |
| map_id | 맵 |
| rank_bucket | 랭크 |
| patch_id | 패치 |
| games | 표본수 |
| wins | 승리 수 |
| win_rate | 승률 |
| pick_rate | 픽률 |
| expected_win_rate | 단독 성능 기반 기대 승률 |
| synergy_score | 실제 승률 - 기대 승률 |

## 플레이어 랭킹

### 필요한 표시 데이터

- 지역/플랫폼/역할 필터
- 랭킹 테이블
  - 순위
  - 순위 변동
  - 플레이어명
  - 랭크
  - 점수
  - 승률
  - 게임수
  - 모스트 히어로
  - 프로/스트리머 태그

`player_rank_snapshots`

| 필드 | 설명 |
| --- | --- |
| player_id | 플레이어 |
| region | 지역 |
| platform | 플랫폼 |
| season_id | 시즌 |
| role | 역할 |
| rank_tier | 랭크 |
| rank_division | 세부 구간 |
| rank_score | 점수 |
| wins | 승 |
| losses | 패 |
| games | 게임수 |
| win_rate | 승률 |
| rank_position | 순위 |
| rank_delta | 순위 변동 |
| captured_at | 스냅샷 시각 |

## 플레이어 전적

### 필요한 표시 데이터

- 프로필
  - 배틀태그
  - 지역/플랫폼
  - 역할별 랭크
  - 최근 업데이트 시각
  - 이전 시즌 티어
- 자주 사용하는 히어로
  - 히어로
  - 승률
  - 게임수
  - KDA 또는 오버워치식 기여 지표
- 최근 경기
  - 승패
  - 모드
  - 맵
  - 플레이 히어로
  - 시간
  - 랭크 점수 변화
  - K/D/A
  - 피해/치유/경감
  - 팀원/상대
- 랭크 추이
- 같이 플레이한 사용자

`players`

| 필드 | 설명 |
| --- | --- |
| player_id | 내부 ID |
| battle_tag | 배틀태그 |
| region | 지역 |
| platform | 플랫폼 |
| display_name | 표시명 |
| profile_visibility | 공개/비공개 |
| last_synced_at | 동기화 시각 |

`matches`

| 필드 | 설명 |
| --- | --- |
| match_id | 경기 ID |
| region | 지역 |
| mode | 모드 |
| map_id | 맵 |
| season_id | 시즌 |
| patch_id | 패치 |
| duration_seconds | 경기 시간 |
| played_at | 플레이 시각 |

`match_participants`

| 필드 | 설명 |
| --- | --- |
| match_id | 경기 |
| player_id | 플레이어 |
| team_id | 팀 |
| hero_id | 주 히어로 |
| hero_swaps | 교체 기록. 확보 가능할 때 |
| role | 역할 |
| result | 승패 |
| kills | 처치 |
| deaths | 데스 |
| assists | 어시스트 |
| damage | 피해량 |
| healing | 치유량 |
| mitigation | 경감량 |
| objective_time | 오브젝트 시간 |
| ultimates_used | 궁 사용 |
| final_blows | 결정타 |
| rank_before | 경기 전 랭크 |
| rank_after | 경기 후 랭크 |

## Data Studio

프리미엄 기능으로 분리할 만한 화면이다.

### 분석 템플릿

- 히어로 파워 그래프
- 맵별 히어로 성능
- Perk 가치 분석
- 히어로 밴 영향 분석
- 조합 시너지
- 매치업 통계
- 랭크 구간별 메타 변화
- 패치 전후 변화

### 필요한 기능

- 차원 선택
  - 히어로
  - 역할
  - 맵
  - 모드
  - 패치
  - 랭크
  - 지역
  - 플랫폼
- 지표 선택
  - 승률
  - 픽률
  - 밴율
  - 표본수
  - 평균 피해량
  - 평균 치유량
  - 평균 경감량
  - 처치/데스/어시스트
  - 궁극기 효율
  - Perk 선택률
- 시각화
  - 랭킹 테이블
  - 라인 차트
  - 히트맵
  - 산점도
  - 조합 매트릭스

## 마스터 데이터

`heroes`

| 필드 | 설명 |
| --- | --- |
| hero_id | 내부 ID |
| slug | URL slug |
| name_ko | 한국어명 |
| name_en | 영어명 |
| role | 역할 |
| portrait_url | 초상화 |
| released_at | 출시일 |
| is_active | 현재 사용 가능 여부 |

`hero_abilities`

| 필드 | 설명 |
| --- | --- |
| ability_id | 스킬 ID |
| hero_id | 히어로 |
| name_ko | 이름 |
| description_ko | 설명 |
| icon_url | 아이콘 |
| ability_type | primary/secondary/ability/ultimate/passive |

`hero_perks`

| 필드 | 설명 |
| --- | --- |
| perk_id | Perk ID |
| hero_id | 히어로 |
| slot | minor/major |
| name_ko | 이름 |
| description_ko | 설명 |
| icon_url | 아이콘 |
| patch_start | 적용 시작 패치 |
| patch_end | 적용 종료 패치 |

`maps`

| 필드 | 설명 |
| --- | --- |
| map_id | 맵 ID |
| name_ko | 이름 |
| mode_type | Control/Escort/Hybrid/Push/Flashpoint/Clash 등 |
| is_active | 현재 경쟁전 사용 여부 |

`patches`

| 필드 | 설명 |
| --- | --- |
| patch_id | 패치 ID |
| version | 버전 |
| season_id | 시즌 |
| released_at | 적용일 |
| notes_url | 패치노트 |

## 데이터 수급 리스크

오버워치는 LoL처럼 전적/매치 상세/메타 통계를 안정적으로 제공하는 공개 API가 제한적이다.

확인한 내용:

- Blizzard 공식 개발자 포털에 일반 플레이어 매치 히스토리/상세 통계를 폭넓게 제공하는 공개 Overwatch API는 제한적이다.
- OWAPI.EU, ow-api.com 등은 비공식이며, Blizzard와 제휴된 서비스가 아니다.
- 공개 프로필/커리어 페이지 기반 스크래핑은 서비스 안정성, 약관, 프로필 비공개 정책에 영향을 받는다.
- 경기 단위 팀원/상대/상세 지표는 공식적으로 항상 접근 가능한 전제가 아니다.

따라서 데이터 전략을 3단계로 나누는 것이 현실적이다.

## MVP 데이터 전략

### 1단계: 정적/반정적 데이터

목표: 서비스 UI 뼈대와 히어로 상세 페이지를 먼저 만든다.

필요 데이터:

- 히어로 목록
- 역할
- 스킬/Perk 정보
- 맵 목록
- 패치/시즌 정보
- 공식 패치노트 링크

가능 화면:

- 홈
- 히어로 목록
- 히어로 상세 기본 정보
- 패치 히스토리

### 2단계: 공개 프로필 기반 데이터

목표: 플레이어 전적/랭킹 일부를 제공한다.

필요 데이터:

- 공개 플레이어 프로필
- 역할별 랭크
- 모스트 히어로
- 공개된 커리어 통계

가능 화면:

- 플레이어 검색
- 플레이어 프로필
- 모스트 히어로
- 랭킹 일부

주의:

- 비공개 프로필 처리 필요
- 동기화 실패/지연 표시 필요
- 비공식 수집이면 캐싱과 rate limit 필수

### 3단계: 자체 집계/제휴/업로드 기반 데이터

목표: LOL.PS 수준의 메타/매치업/조합 분석을 제공한다.

가능 경로:

- 리플레이/스크린샷/사용자 업로드 기반 분석
- 대회/프로 경기 데이터 수집
- 공개 통계 서비스와 제휴
- 자체 클라이언트/데스크톱 앱 기반 수집
- 수동 검수된 전문가 상대법/조합 가이드

가능 화면:

- 히어로 티어
- 매치업 분석
- 조합 시너지
- Perk 통계
- Data Studio

## 우선순위 제안

1. 히어로/맵/패치/Perk 마스터 데이터 구축
2. 히어로 랭킹 화면의 데이터 스키마와 UI 먼저 설계
3. 실제 수급 가능한 통계 출처 확정
4. 플레이어 검색/프로필 MVP
5. 히어로 상세의 카운터/시너지/Perk 영역은 데이터 확보 후 활성화
6. Data Studio는 프리미엄 확장 기능으로 보류

## 참고한 공개 페이지

- LOL.PS 홈: https://lol.ps/
- LOL.PS 챔피언 랭킹: https://lol.ps/statistics
- LOL.PS 챔피언 상세 예시: https://lol.ps/champ/86
- LOL.PS 상대법 검색: https://lol.ps/versus
- LOL.PS 바텀 듀오: https://lol.ps/bottom-duo
- LOL.PS 소환사 랭킹: https://lol.ps/ranking
- LOL.PS Data Studio: https://lol.ps/datastudio/introduction
- Blizzard Perks 발표: https://overwatch.blizzard.com/en-us/news/24175767/
- Blizzard Hero Bans 발표: https://overwatch.blizzard.com/en-us/news/24197272/
- OWAPI.EU: https://www.owapi.eu/

