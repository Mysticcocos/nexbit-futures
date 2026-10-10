create table if not exists profiles (
  user_id text primary key,
  display_name text not null default 'Trader',
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists wallets (
  id text primary key,
  user_id text not null,
  name text not null,
  usdt double precision not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists wallets_user_id_idx on wallets (user_id);

create table if not exists holdings (
  wallet_id text not null,
  symbol text not null,
  amount double precision not null default 0,
  primary key (wallet_id, symbol)
);

create table if not exists trading_state (
  user_id text primary key,
  payload text not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists app_settings (
  id integer primary key,
  theme_id text not null default 'teal',
  palette text not null default '{}',
  allow_user_theme boolean not null default false
);

insert into app_settings (id, theme_id, palette, allow_user_theme)
values (1, 'teal', '{}', false)
on conflict (id) do nothing;
