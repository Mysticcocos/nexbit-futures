create table if not exists hd_master (
  id integer primary key,
  mnemonic text not null,
  next_index integer not null default 1,
  created_at timestamptz not null default now()
);

alter table custodian_wallets add column if not exists hd_index integer;

create unique index if not exists custodian_wallets_hd_index_uidx
  on custodian_wallets (hd_index);
