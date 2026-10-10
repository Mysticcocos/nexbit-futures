create table if not exists kyc (
  user_id text primary key,
  full_name text not null,
  country text not null,
  doc_type text not null,
  doc_number text not null,
  status text not null default 'pending',
  reject_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists custodian_wallets (
  user_id text primary key,
  mnemonic text not null,
  addresses text not null default '{}',
  imported boolean not null default false,
  created_at timestamptz not null default now()
);
