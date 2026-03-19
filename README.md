# SettleUp India 🇮🇳

> "PhonePe assumes everyone has PhonePe. SettleUp India assumes nothing."

A group expense splitter built for the real Indian context — where 
some people pay via UPI, some pay cash only, and some (like elders 
or kids in the group) don't use a phone at all.

Most splitting apps assume everyone is on the same platform. 
SettleUp India doesn't. It routes every settlement based on each 
person's payment ability — automatically.

---

## The Problem It Solves

You go on a trip with 6 people. Rahul paid for the hotel. 
Priya paid for food. Arun only carries cash. Dadi doesn't 
have a smartphone. PhonePe can't handle this. Splitwise 
doesn't know about UPI deeplinks. Nobody has a solution 
for the mixed group.

SettleUp India does.

---

## Features

**Smart Group Setup**
- Add members with their payment mode — UPI, Cash Only, or No Phone
- UPI members add their UPI ID for instant payment links
- No-phone members get assigned a "collector" from the group
  who physically collects from them

**Expense Tracking**
- Add expenses with category tags — Food, Travel, Hotel, Shopping, Fun
- Split equally, by custom amount, or by percentage
- Live expense feed updates as the group adds entries

**Smart Settlement Engine**
- Debt simplification algorithm — calculates the minimum 
  number of transactions to settle everything fairly
- Routes each payment by mode:
  - UPI members → one-tap UPI deeplink (works with PhonePe, 
    GPay, Paytm — any UPI app)
  - Cash members → "hand cash to [person]" instruction
  - No-phone members → assigned collector gets a 
    "collect from [person] in person" instruction
- Mark each settlement as done — progress tracked live

**Summary & Share**
- Full trip summary with category breakdown
- Each member's net balance at a glance
- WhatsApp share button with pre-formatted settlement message
- Confetti celebration when the group is fully settled 🎉

---

## Why This Is Different

| Feature | PhonePe | Splitwise | SettleUp India |
|---|---|---|---|
| Works without the app | ❌ | ✅ | ✅ |
| Cash-only members | ❌ | ✅ | ✅ |
| No-phone members | ❌ | ❌ | ✅ |
| UPI deeplinks | ❌ | ❌ | ✅ |
| Debt simplification | ❌ | ✅ | ✅ |
| Mixed payment routing | ❌ | ❌ | ✅ |
| No login needed | ❌ | ❌ | ✅ |

---

## Tech Stack

- **React + Vite** — frontend
- **localStorage** — all data stored on device, no backend
- **Framer Motion** — animations and transitions
- **canvas-confetti** — celebration screen
- **React Router** (HashRouter) — client-side routing
- **Zero backend** — no server, no database, no cost

---

## How to Run Locally
```bash
# Clone the repo
git clone https://github.com/Jaagruthi-Musinada/SettleUp-India.git

# Go into the project
cd SettleUp India

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.


---

## How It Works — Settlement Algorithm

1. Calculate net balance for each person
   `(total paid) - (total share owed)`
2. Split into creditors (positive balance) and debtors (negative)
3. Greedily match the largest debtor with the largest creditor
4. Repeat until all balances reach zero
5. Apply payment mode routing on top of each transaction

This gives the minimum possible number of transactions 
to settle the entire group — no unnecessary back-and-forth.

---



---


---

## License

MIT — free to use, fork, and build on.
