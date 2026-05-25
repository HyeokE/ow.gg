# 현재 보유 데이터 기반 페이지 기획

작성일: 2026-05-25  
기준 코드: `src/lib/overfast/openapi.json`, `src/lib/overfast/schema.ts`, `src/lib/overfast/models.ts`, `src/lib/overfast/client.ts`, `src/app/api/overfast/[[...path]]/route.ts`

## 1. 결론

현재 모델 타입 기준으로 `ow-gg`가 바로 만들 수 있는 핵심 제품은 다음 4개다.

1. 히어로 도감/상세
2. 플레이어 검색/프로필/히어로별 통계
3. 맵/게임 모드 도감
4. 히어로 픽률/승률 랭킹

단, 4번 히어로 픽률/승률 랭킹은 타입상 존재하지만 2026-05-25 라이브 확인 기준 `/heroes/stats`가 500을 반환했다. 따라서 첫 출시 화면에서는 기능 플래그 또는 비활성 상태로 설계하고, 안정 데이터인 히어로/플레이어/맵 중심으로 MVP를 잡는 것이 맞다.

`lol.ps`에서 가장 강한 화면인 챔피언 티어, 상대법, 듀오 조합, 소환사 랭킹은 오버워치에서는 현재 데이터만으로 그대로 복제하기 어렵다. 특히 매치업, 조합 시너지, 경기 기록, 공개 랭킹은 별도 수집/저장 파이프라인이 필요하다.

## 2. 현재 데이터 인벤토리

### 2.1 안정적으로 사용 가능한 데이터

| 데이터 | API/모델 | 주요 필드 | 화면 활용 |
| --- | --- | --- | --- |
| 히어로 목록 | `listHeroes`, `HeroShort` | `key`, `name`, `portrait`, `role`, `subrole`, `gamemodes` | 홈, 히어로 목록, 비교 도구, 상세 연관 히어로 |
| 히어로 상세 | `getHero`, `Hero` | `description`, `backgrounds`, `hitpoints`, `abilities`, `perks`, `stadium_powers`, `story` | 히어로 상세, 능력/특성/스타디움 빌드 정보 |
| 역할 목록 | `listRoles`, `RoleDetail` | `key`, `name`, `icon`, `description` | 역할 필터, 역할 안내 |
| 맵 목록 | `listMaps`, `Map` | `key`, `name`, `screenshot`, `gamemodes`, `location`, `country_code` | 맵 목록, 게임 모드별 맵 필터 |
| 게임 모드 | `listMapGamemodes`, `GamemodeDetails` | `key`, `name`, `icon`, `description`, `screenshot` | 맵/모드 도감 |
| 플레이어 검색 | `searchPlayers`, `PlayerSearchResult` | `total`, `results[]`, `player_id`, `name`, `avatar`, `namecard`, `is_public` | 홈 검색, 검색 결과 페이지 |
| 플레이어 요약 | `getPlayerSummary`, `PlayerSummary` | `username`, `avatar`, `namecard`, `title`, `endorsement`, `competitive`, `last_updated_at` | 플레이어 프로필 헤더, 경쟁전 티어 |
| 플레이어 요약 통계 | `getPlayerStatsSummary`, `PlayerStatsSummary` | `general`, `roles`, `heroes`, `games_played`, `winrate`, `kda`, `average`, `total` | 프로필 개요, 역할별/히어로별 성과 |
| 플레이어 커리어 통계 | `getPlayerCareerStats`, `PlayerCareerStats` | 히어로별 `combat`, `game`, `best`, `average`, `hero_specific` | 히어로 상세 성과, 고급 통계 탭 |

라이브 샘플 확인 결과:

- `heroes?locale=ko-kr`: 51개 히어로 반환.
- `maps`: 57개 맵 반환.
- `gamemodes`: 14개 모드 반환.
- `players?name=TeKrop`: 플레이어 검색 정상 반환.
- `players/{player_id}/summary`, `players/{player_id}/stats/summary`: 정상 반환.

### 2.2 타입은 있으나 운영 리스크가 있는 데이터

| 데이터 | API/모델 | 상태 | 기획 반영 |
| --- | --- | --- | --- |
| 전역 히어로 승률/픽률 | `getHeroStats`, `HeroStatsSummary` | 2026-05-25 라이브 확인 기준 `500 Internal Server Error` | `/stats/heroes`는 설계하되 MVP에서는 feature flag 처리 |

`getHeroStats`는 타입상 다음 필터를 지원한다.

- 필수: `platform`, `gamemode`, `region`
- 선택: `role`, `map`, `competitive_division`, `order_by`
- 정렬: `hero`, `winrate`, `pickrate`

정상화되면 `lol.ps`의 챔피언 랭킹에 해당하는 “히어로 메타 랭킹” 화면을 만들 수 있다.

### 2.3 현재 데이터만으로 불가능한 데이터

| 원하는 화면 | 부족한 데이터 | 대안 |
| --- | --- | --- |
| 플레이어 랭킹 | 전체 플레이어 리더보드/랭킹 API 없음 | 자체 수집한 검색/프로필 캐시 기반 미니 랭킹만 가능 |
| 매치 히스토리 | 경기 단위 목록, 맵, 팀, 결과, 히어로 교체 기록 없음 | 플레이어 누적 통계 중심으로 대체 |
| 히어로 상대법 | 히어로 대 히어로 승률, 조우 데이터 없음 | 수동 가이드/커뮤니티 데이터 필요 |
| 조합/시너지 | 팀 구성별 승률, 동시 픽 데이터 없음 | 수동 큐레이션 또는 자체 매치 데이터 수집 필요 |
| 패치별 메타 추이 | 시계열 스냅샷 없음 | 주기적 저장 잡 필요 |
| 밴율 | 밴 데이터 없음 | 현재 제외 |

## 3. 정보 구조

권장 1차 내비게이션:

- `/` 홈
- `/heroes` 히어로
- `/stats/heroes` 히어로 통계
- `/players` 플레이어 검색
- `/maps` 맵

권장 상세 라우트:

- `/heroes/[heroKey]`
- `/players/[playerId]`
- `/players/[playerId]/heroes/[heroKey]`
- `/maps/[mapKey]`는 현재 `getMap` 단건 API가 없으므로 목록 데이터에서 파생하거나 2차로 보류

`lol.ps`의 구조와 대응하면 다음과 같다.

| lol.ps 개념 | ow-gg 화면 | 현재 구현 가능성 |
| --- | --- | --- |
| 홈 | `/` | 가능 |
| 챔피언 랭킹 | `/stats/heroes` | 타입상 가능, API 안정화 필요 |
| 챔피언 상세 | `/heroes/[heroKey]` | 가능 |
| 소환사 검색/상세 | `/players`, `/players/[playerId]` | 가능 |
| 맵/모드 정보 | `/maps` | 가능 |
| 상대법 | 보류 | 데이터 없음 |
| 듀오/조합 | 보류 | 데이터 없음 |
| 소환사 랭킹 | 보류 | 데이터 없음 |
| Data Studio | 2차 | 시계열/저장 데이터 필요 |

## 4. 화면별 기획

### 4.1 홈 `/`

목적:

- 오버워치 플레이어 전적 검색을 첫 행동으로 만든다.
- 안정 데이터 기반으로 히어로/맵 탐색 진입점을 제공한다.
- `heroes/stats`가 안정화되면 상단에 메타 랭킹 요약을 붙인다.

필요 데이터:

- `searchPlayers`는 사용자가 검색할 때 호출.
- 초기 렌더: `listHeroes({ locale: "ko-kr" })`, `listMaps()`, `listMapGamemodes()`.
- 선택 데이터: `getHeroStats({ platform: "pc", gamemode: "competitive", region: "asia" })`.

구성:

- 플레이어 검색 바
  - BattleTag는 `#` 대신 `-`를 허용한다.
  - 예: `Player-1234`
- 히어로 바로가기
  - 역할 탭: 전체, 탱커, 딜러, 지원
  - 히어로 초상화 그리드
- 인기 탐색
  - `heroes/stats` 사용 가능 시: 픽률 상위, 승률 상위
  - 사용 불가 시: 최근 추가/전체 히어로/스타디움 가능 히어로
- 맵/모드 진입
  - 모드별 맵 개수 표시

빈 상태/오류:

- 플레이어 검색 결과가 없으면 “정확한 BattleTag 또는 대소문자를 확인” 안내.
- `heroes/stats` 실패 시 홈 전체를 실패시키지 말고 해당 모듈만 숨긴다.

### 4.2 히어로 목록 `/heroes`

목적:

- 오버워치 히어로 전체를 빠르게 필터링하고 상세로 진입한다.

필요 데이터:

- `listHeroes({ locale: "ko-kr", role?, gamemode? })`
- `listRoles({ locale: "ko-kr" })`

필터:

- 검색어: 히어로 이름
- 역할: `tank`, `damage`, `support`
- 서브 역할: `flanker`, `recon`, `sharpshooter`, `specialist`, `medic`, `survivor`, `tactician`, `bruiser`, `initiator`, `stalwart`
- 게임 모드: `quickplay`, `stadium`

표시 필드:

- 초상화
- 이름
- 역할/서브 역할
- 플레이 가능 모드

정렬:

- 이름순
- 역할순
- 스타디움 가능 여부

### 4.3 히어로 상세 `/heroes/[heroKey]`

목적:

- 히어로를 플레이하기 전에 필요한 능력, 생명력, 특성, 스타디움 파워, 스토리를 한 화면에서 제공한다.

필요 데이터:

- `getHero(heroKey, { locale: "ko-kr" })`
- 보조: `listHeroes({ locale: "ko-kr", role })`
- 선택: `getHeroStats(...)`로 현재 픽률/승률 표시

구성:

- 히어로 헤더
  - 배경 이미지
  - 초상화
  - 이름, 역할, 서브 역할
  - 위치, 나이, 생일
- 기본 스탯
  - 생명력, 방어구, 보호막, 총합
- 능력
  - 이름, 설명, 아이콘
  - 비디오 썸네일/재생 링크
- 특성
  - Minor / Major 구분
- 스타디움
  - `stadium_powers`가 있으면 12개 파워 표시
  - 없으면 “스타디움 미지원” 상태
- 스토리
  - 요약, 미디어, 챕터
- 관련 히어로
  - 같은 역할/서브 역할 히어로

주의:

- `portrait`, `hitpoints`, `stadium_powers`는 nullable 가능성이 있다.
- 새 히어로 출시 직후 초상화가 null일 수 있으므로 fallback 이미지가 필요하다.

### 4.4 히어로 통계 `/stats/heroes`

목적:

- `lol.ps`의 챔피언 랭킹에 해당하는 메타 탐색 화면이다.
- 픽률과 승률을 기준으로 역할/지역/랭크/맵별 히어로를 비교한다.

현재 상태:

- 타입과 클라이언트는 준비됨.
- 라이브 API는 2026-05-25 확인 기준 500 반환.
- 따라서 MVP에서는 “실험적” 또는 “데이터 준비 중” 상태로 둔다.

필요 데이터:

- `getHeroStats({ platform, gamemode, region, role?, map?, competitive_division?, order_by? })`
- `listHeroes({ locale: "ko-kr" })`로 히어로 이름/초상화 join
- `listMaps()`로 맵 필터 구성

필터:

- 플랫폼: `pc`, `console`
- 게임 모드: `competitive`, `quickplay`
- 지역: `asia`, `americas`, `europe`
- 역할: 전체, 탱커, 딜러, 지원
- 티어: 브론즈, 실버, 골드, 플래티넘, 다이아, 마스터, 그랜드마스터
- 맵: 전체 또는 맵 선택

표시 컬럼:

- 순위
- 히어로
- 역할
- 픽률
- 승률
- 티어 지표

파생 지표:

- 단순 티어 점수 예시: `winrate z-score * 0.6 + pickrate z-score * 0.4`
- 픽률이 너무 낮은 히어로의 승률 과대평가를 막기 위해 최소 픽률 기준을 둔다.

오류 정책:

- 500이면 테이블 대신 “현재 전역 통계 API가 불안정합니다” 상태를 표시한다.
- 히어로 도감/플레이어 검색은 계속 사용 가능해야 한다.

### 4.5 플레이어 검색 `/players`

목적:

- BattleTag/닉네임으로 프로필을 찾고 상세 페이지로 이동한다.

필요 데이터:

- `searchPlayers({ name, limit, offset, order_by })`

검색 입력:

- 닉네임
- BattleTag 형식: `Name-1234`
- `#` 입력 시 내부적으로 `-` 변환 가능

검색 결과 표시:

- 아바타
- 이름
- 칭호
- 공개 여부 `is_public`
- 마지막 업데이트 `last_updated_at`
- 이동 대상 `player_id`

주의:

- `player_id`가 BattleTag가 아니라 Blizzard hexadecimal ID일 수 있다.
- 대소문자가 중요하다는 API 설명이 있으므로 실패 안내에 포함한다.
- 비공개 프로필은 상세 통계가 제한될 수 있다.

### 4.6 플레이어 상세 `/players/[playerId]`

목적:

- 오버워치 개인 전적 페이지의 핵심 화면이다.
- `lol.ps`의 소환사 상세와 같은 역할을 하지만, 현재 API에는 매치 히스토리가 없으므로 누적 통계 중심으로 설계한다.

필요 데이터:

- `getPlayerSummary(playerId)`
- `getPlayerStatsSummary(playerId, { gamemode?, platform? })`
- 고급 탭에서 `getPlayerCareerStats(playerId, { gamemode, platform?, hero? })`
- 선택: `getPlayerStats(playerId, { gamemode, platform?, hero? })`
- 히어로 이름/초상화 매핑용 `listHeroes({ locale: "ko-kr" })`

필터:

- 플랫폼: 전체, PC, 콘솔
- 게임 모드: 전체, 경쟁전, 빠른 대전
- 히어로: 전체 또는 특정 히어로

구성:

- 프로필 헤더
  - namecard 배경
  - 아바타
  - 닉네임, 칭호
  - 추천 레벨
  - 마지막 업데이트
- 경쟁전 티어
  - PC/콘솔 분리
  - 탱커, 딜러, 지원, 오픈큐
  - 시즌 번호
- 개요 카드
  - 게임 수, 승률, KDA, 플레이 시간
  - 총 처치/도움/죽음/피해/치유
  - 10분 평균 처치/도움/죽음/피해/치유
- 역할별 성과
  - 탱커/딜러/지원별 승률, KDA, 플레이 시간
- 히어로별 성과 테이블
  - 히어로, 게임 수, 승률, KDA, 플레이 시간, 10분 평균 피해/치유
  - 정렬: 플레이 시간, 승률, 게임 수, KDA
- 고급 통계 탭
  - 전투, 게임, 최고 기록, 평균, 히어로 특화 통계

빈 상태/오류:

- 비공개 프로필이면 검색 결과는 보여주되 상세 통계는 제한 안내.
- `general`, `roles`, `heroes`는 null 가능성이 있으므로 각 섹션 단위로 빈 상태가 필요하다.
- `games_played`가 0인데 `time_played`가 있는 히어로가 존재할 수 있으므로 승률 표현은 조심해야 한다.

### 4.7 플레이어 히어로 상세 `/players/[playerId]/heroes/[heroKey]`

목적:

- 특정 플레이어가 특정 히어로를 얼마나 잘 쓰는지 깊게 보여준다.

필요 데이터:

- `getHero(heroKey, { locale: "ko-kr" })`
- `getPlayerStatsSummary(playerId, { gamemode?, platform? })`
- `getPlayerCareerStats(playerId, { gamemode, platform?, hero: heroKey })`

구성:

- 히어로 기본 정보
- 해당 플레이어의 히어로 요약
  - 게임 수, 승률, KDA, 플레이 시간
- 카테고리별 상세 통계
  - `combat`, `game`, `best`, `average`, `hero_specific`, `assists`, `match_awards`
- 전체 히어로 평균 대비 비교
  - 현재는 같은 플레이어 내부 비교만 가능
  - 전역 평균 비교는 추가 데이터 필요

### 4.8 맵 목록 `/maps`

목적:

- 오버워치 맵과 게임 모드를 탐색하는 도감형 화면이다.

필요 데이터:

- `listMaps({ gamemode? })`
- `listMapGamemodes()`

필터:

- 게임 모드
- 지역/국가 코드
- 검색어

표시 필드:

- 스크린샷
- 맵 이름
- 게임 모드
- 위치
- 국가 코드

확장:

- `getHeroStats`가 안정화되면 특정 맵에서 픽률/승률 상위 히어로를 표시할 수 있다.

### 4.9 히어로 비교 `/compare`

목적:

- 현재 안정 데이터만으로 만들 수 있는 실용 도구다.
- 2~3개 히어로를 선택해 생명력, 역할, 능력, 특성, 스타디움 파워를 비교한다.

필요 데이터:

- `listHeroes({ locale: "ko-kr" })`
- 선택된 히어로마다 `getHero(heroKey, { locale: "ko-kr" })`

구성:

- 히어로 선택 콤보박스
- 기본 스탯 비교
- 능력 비교
- Minor/Major 특성 비교
- 스타디움 파워 비교

우선순위:

- MVP 필수는 아니지만, 전역 통계가 불안정할 때 빈 메타 화면을 대체할 수 있는 좋은 기능이다.

## 5. MVP 우선순위

### Phase 1: 안정 데이터 기반 MVP

1. 홈
2. 히어로 목록
3. 히어로 상세
4. 플레이어 검색
5. 플레이어 상세
6. 맵 목록

이 단계는 `heroes/stats` 없이도 출시 가능하다.

### Phase 2: 통계 화면

1. 히어로 통계 `/stats/heroes`
2. 맵별 히어로 통계
3. 티어 점수 계산
4. 통계 API 실패 시 fallback/캐시 정책

전제:

- `getHeroStats`가 정상 응답하거나, 우리 서버가 주기적으로 데이터를 수집해 안정 캐시를 제공해야 한다.

### Phase 3: 자체 데이터가 필요한 고급 기능

1. 플레이어 랭킹
2. 히어로 상대법
3. 조합/시너지
4. 패치별 메타 추이
5. Data Studio

전제:

- 외부 API만 호출하는 구조가 아니라 자체 DB와 배치 수집이 필요하다.

## 6. 공통 데이터 처리 정책

### 6.1 Locale

기본 locale은 `ko-kr`로 둔다.  
단, 일부 텍스트가 번역 누락될 수 있으므로 표시 컴포넌트는 영어 fallback을 허용한다.

### 6.2 이미지

이미지 URL은 대부분 외부 CDN이다.

- `portrait`
- `backgrounds`
- `avatar`
- `namecard`
- `rank_icon`
- `tier_icon`
- `map.screenshot`
- `gamemode.screenshot`

구현 시 Next Image remote pattern 설정이 필요하다.  
단, 코드 구현 전에는 현재 Next 버전 문서를 먼저 확인해야 한다.

### 6.3 캐시

OpenAPI 설명 기준:

- 히어로/역할/맵/모드: 1일 캐시 성격
- 플레이어 검색/프로필/통계: 10분 캐시 성격
- 히어로 전역 통계: 1시간 캐시 성격

페이지 정책:

- 히어로/맵 도감은 정적 성격으로 긴 캐시 가능
- 플레이어 상세는 10분 단위 refresh UX
- 전역 통계는 장애 대응을 위해 서버 캐시를 두는 것이 좋다

### 6.4 Null/오류 상태

필수로 처리해야 하는 케이스:

- `portrait` null
- `hitpoints` null
- `stadium_powers` null
- `competitive` null
- `general`, `roles`, `heroes` null
- 플레이어 비공개
- OverFast rate limit
- OverFast 500/502

섹션 단위 fallback을 기본으로 한다. 한 API가 실패해도 전체 페이지를 망가뜨리지 않는다.

## 7. 권장 컴포넌트 단위

공통:

- `PlayerSearchBox`
- `HeroPortrait`
- `RoleBadge`
- `StatCard`
- `StatTable`
- `FilterBar`
- `EmptyState`
- `ApiErrorPanel`

히어로:

- `HeroGrid`
- `HeroHeader`
- `HeroAbilityList`
- `HeroPerkList`
- `HeroStadiumPowers`
- `HeroStory`

플레이어:

- `PlayerProfileHeader`
- `CompetitiveRankGrid`
- `PlayerSummaryStats`
- `RoleStatsGrid`
- `HeroStatsTable`
- `CareerStatsSections`

맵:

- `MapGrid`
- `GamemodeTabs`
- `MapCard`

## 8. 구현 순서 제안

1. OverFast 서버 API 래퍼 기준으로 fetch 계층 정리
2. `ko-kr` 기본 locale 상수화
3. 홈 검색 + 히어로 목록부터 구현
4. 히어로 상세 구현
5. 플레이어 검색/상세 구현
6. 맵 목록 구현
7. `heroes/stats` 상태 재확인 후 통계 화면 feature flag 오픈

## 9. 추가 수집이 필요한 데이터 설계 초안

`lol.ps` 수준의 통계 사이트로 가려면 다음 데이터가 추가되어야 한다.

| 테이블/집계 | 목적 |
| --- | --- |
| `hero_meta_snapshots` | 패치/날짜/지역/티어/맵별 픽률, 승률 시계열 |
| `player_snapshots` | 검색된 플레이어의 주기적 프로필/통계 스냅샷 |
| `hero_matchups` | 히어로 대 히어로 상대 승률 |
| `team_compositions` | 팀 조합별 픽률/승률 |
| `map_hero_stats` | 맵별 히어로 성능 |
| `patches` | 패치 버전, 적용일, 메타 구간 |

현재 OverFast API만으로는 이 데이터를 완성할 수 없다. 따라서 Phase 3부터는 외부 데이터 소스 검토 또는 자체 수집 전략이 필요하다.

