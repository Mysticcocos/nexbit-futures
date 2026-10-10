create table if not exists deposit_addresses (
  id text primary key,
  user_id text not null,
  asset text not null,
  network text not null,
  address text not null,
  memo text,
  source text not null default 'engine',
  created_at timestamptz not null default now(),
  unique (user_id, asset, network)
);
create index if not exists deposit_addresses_user_idx on deposit_addresses (user_id);
create unique index if not exists deposit_addresses_addr_idx on deposit_addresses (address, network);

create table if not exists cash_deposits (
  id text primary key,
  user_id text not null,
  asset text not null,
  network text not null,
  amount double precision not null,
  address text,
  txid text,
  status text not null default 'waiting',
  created_at timestamptz not null default now()
);
create index if not exists cash_deposits_user_idx on cash_deposits (user_id);

create table if not exists cash_withdrawals (
  id text primary key,
  user_id text not null,
  asset text not null,
  network text not null,
  amount double precision not null,
  fee double precision not null default 0,
  address text not null,
  memo text,
  txid text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists cash_withdrawals_status_idx on cash_withdrawals (status);
