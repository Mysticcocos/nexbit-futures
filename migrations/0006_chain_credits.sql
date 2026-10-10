create table if not exists chain_credits (
  txid text primary key,
  user_id text not null,
  asset text not null,
  network text not null,
  amount double precision not null,
  address text not null,
  credited_at timestamptz not null default now()
);
create index if not exists chain_credits_user_idx on chain_credits (user_id);
