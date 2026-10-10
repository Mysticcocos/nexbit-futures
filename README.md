# NEXBIT

Mobile-first crypto, forex and metals exchange. Each signed-in account gets its
own empty wallets. Crypto marks try Binance’s public ticker. Trade uses a
**NEXBIT candlestick chart** (custom canvas — not TradingView) with timeframes
from 15 seconds to 2 months.

**Свой домен:** см. [DEPLOY.md](./DEPLOY.md) — Vercel + Postgres + DNS.

## Try it

- Guests see a landing screen — tap **Enter NEXBIT**, then sign in or register (email, Google, or X).
- After sign-in you land in **Wallet**. Top up USDT or create extra wallets (they start at $0).
- **Exchange** is the live tape: prices tick continuously, 24h % is green on the plus and red on the minus.
- Trade crypto, FX and metals. Futures leverage, uPNL and liquidation math are live.
- On Trade, the bottom bar is your **positions / orders dock** (Home/Markets/Earn/Assets stay off this screen).
- Earn, Copy Trade, Support (chat + tickets + FAQ) all work — nothing is a stub.

## Admin

The first registered account is admin. Open Account → Admin desk to list every member, credit wallets, set roles, and publish a global color grade (teal, blue, red, …). The published theme is stored in the database and survives reload. Shadows follow the accent.

Temporary demo desks:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@nexbit.io` | `NexbitAdmin1` |
| User | `user@nexbit.io` | `NexbitUser1` |

## Pairs

Crypto BTC/ETH/SOL and majors vs USDT, FX EUR/USD and siblings, metals XAU/XAG vs USD.
