# NEXBIT: Futures pair selector update (10 Oct 2026)

## Updated
- Preserved original application structure, mobile/desktop interfaces, routes and server API.
- Added 109 additional crypto trading pair catalogue entries; existing entries remain.
- Search by coin name, ticker or full pair in the Futures contracts selector on both desktop and mobile.
- Filter the list by quote asset (USDT or USDC); FX/metals remain available under All quotes.

## Important limitations
- This project contains a simulated/internal futures order engine; adding a symbol to the catalogue does not make it a real exchange-listed futures instrument. The public price feeds are primarily spot market data, not necessarily futures mark/index prices.
- Symbols with no public price feed can display indicative hardcoded seed prices. Such symbols must not be used for actual-money settlement or calculations without a verified futures mark-price and an instrument catalogue from a real venue.
- No trading venue keys/order execution have been integrated. No guarantee that every symbol is currently actively traded or has a 24h price feed.
- In production, seed/admin demonstration accounts must be removed or made inaccessible, and secrets must be securely configured.
- Build/typecheck was not verified in this runtime (npm dependency installation did not complete); test locally and on a staging deployment.
- "8 channels" is not specified in this codebase as an identifiable feature. No new communication-channel system was introduced.

## Recommended zero-cost proof of concept
1. Upload this project as source code to a private GitHub repository; connect to Netlify.
2. Create a free Neon Postgres project, copy DATABASE_URL (never publish it).
3. Netlify build command: npm run build; publish directory: dist (as existing netlify.toml).
4. Set DATABASE_URL, BETTER_AUTH_URL=https://YOUR-SITE.netlify.app, BETTER_AUTH_SECRET=strong-random, CASHIER_SECRET=strong-random.
5. Update BETTER_AUTH_URL to the assigned production URL and redeploy.
6. Set up secure, private admin credentials. Do not accept customer money, real deposits or withdrawals until external security, custody, AML/KYC and trading engine audits are performed.
7. Test /futures and /api/tickers, signup/auth, DB migrations, mobile/desktop, and every new currency pair; inspect Netlify function logs.

Free plans have usage quotas; this is not a guarantee of unlimited availability or uninterrupted 24/7 operation.
