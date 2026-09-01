-- 사용자 상태(앱 state 객체 통째로) 저장. user_id = 로그인 전엔 클라이언트 UUID.
create table if not exists user_state (
  user_id    text primary key,
  data       text not null,
  updated_at text not null default (datetime('now'))
);
