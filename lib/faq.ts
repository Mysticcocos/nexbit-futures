export const FAQ = [
  {
    q: "How do I trade futures on NEXBIT?",
    a: "Open Trade, leave the switch on Futures, pick a pair, set leverage and size, then tap Buy / Long or Sell / Short. The position appears instantly and uPNL starts tracking the live mark.",
  },
  {
    q: "What is leverage?",
    a: "Leverage lets you control a larger notional with less margin. At 10x, $1,000 of margin opens a $10,000 position. Higher leverage also brings liquidation closer — a 10% move against you wipes a 10x position.",
  },
  {
    q: "How is PNL calculated?",
    a: "For linear USDT perps: uPNL = (mark − entry) × quantity × direction. Quantity is size / entry. PNL% = uPNL / margin × 100. Closing credits margin + uPNL back to your USDT wallet.",
  },
  {
    q: "How is liquidation price estimated?",
    a: "Simplifed demo math: liquidation is roughly a 100% / leverage move against you. A 10x long liquidates near entry × 0.90. Real venues add maintenance margin and fees; this demo stays readable.",
  },
  {
    q: "Spot vs Futures — what’s the difference?",
    a: "Spot buys or sells the asset against your wallet (no leverage). Futures are perpetual contracts: you post margin, pick Long or Short, and can use 1x–100x. Metals and FX trade as perps in this demo.",
  },
  {
    q: "Which pairs can I trade?",
    a: "Crypto (BTC, ETH, SOL, XRP, DOGE, BNB, AVAX, LINK, ADA, DOT vs USDT), Forex (EUR, GBP, JPY, AUD, CHF, CAD, NZD and EUR/GBP), and metals (XAU, XAG, XPT, XPD vs USD). Star any pair to keep it in Favorites.",
  },
  {
    q: "How do I switch the chart symbol?",
    a: "Open Markets, tap a pair, or use the search icon. The Trade chart is a NEXBIT candlestick pane for that pair.",
  },
  {
    q: "How do I change the color theme?",
    a: "Admins open Profile → Admin desk and pick a color grade or a custom palette. The published theme is saved for the whole exchange and loads again after refresh.",
  },
  {
    q: "How does Earn work?",
    a: "Flexible pays 4.2% APY and can be withdrawn anytime. Locked pays 8.5% APY. Dual Investment quotes a range. Deposits move USDT from your wallet into Earn; yields accrue visually over time.",
  },
  {
    q: "How do deposits and withdrawals work?",
    a: "This is a demo venue. Deposit credits demo USDT, Withdraw debits it, Transfer moves between wallet and Earn. Nothing leaves this device — balances live in LocalStorage.",
  },
  {
    q: "What is Copy Trade?",
    a: "Copy Trade lists mock lead traders with win-rate and 30d PNL. Tapping Copy opens a small futures position in their style pair using your margin. Uncopy just stops following; open size still needs to be closed on Positions.",
  },
  {
    q: "How do I contact support?",
    a: "Use the chat button on any screen or Profile → Support. Start a live chat, pick a category, or open a ticket. Admins can read and reply to tickets from the Admin desk.",
  },
  {
    q: "Is verification required?",
    a: "The demo account ships as Verified. There is no real KYC. Treat NEXBIT as a front-end simulation, not a licensed exchange.",
  },
  {
    q: "How do I reset the demo?",
    a: "Profile → Reset demo restores the $24,560 starting portfolio, clears positions, orders, tickets and earn, and keeps your theme. Admin login is admin / admin123.",
  },
  {
    q: "Are prices real?",
    a: "Crypto marks try Binance’s public 24h ticker, then fall back to a smooth simulation. Forex and metals use realistic seeds with a live random walk. The NEXBIT chart draws live candles from those marks.",
  },
];

export const SUPPORT_CATEGORIES = [
  "Trading",
  "Deposit / Withdraw",
  "Futures & Leverage",
  "Earn",
  "Verification",
  "Technical",
  "Other",
] as const;

export const QUICK_REPLIES: Record<string, string> = {
  Trading: "You can open Long/Short from Trade with 1x–100x leverage. Size is in USDT; margin = size / leverage.",
  "Deposit / Withdraw": "Use the Deposit, Withdraw or Transfer buttons on Home or Assets. This is a demo wallet stored on your device.",
  "Futures & Leverage": "Higher leverage lowers the distance to liquidation (~100%/leverage). Check the sticky uPNL bar while a position is open.",
  Earn: "Flexible is 4.2% APY with no lock-up. Locked is 8.5%. Open the Earn tab to move USDT in or out.",
  Verification: "Your demo profile is already marked Verified. No documents are collected.",
  Technical: "If the chart is blank, switch timeframe with the clock icon. Resetting the demo from Profile often clears odd state.",
  Other: "Got it — tell me a bit more and I’ll route this. You can also open a ticket so an admin can reply.",
};

export const BOT_GREETING =
  "Hi, I’m NEXBIT Support. 24/7 desk for trading, wallets, futures and Earn. Pick a topic or type a question.";
