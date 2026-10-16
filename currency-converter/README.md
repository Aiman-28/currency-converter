# Currency Converter (Vue 3 + Pinia)

A frontend-only Currency Converter built as an internship project. It includes signup/login, protected routes, a dashboard, a live converter and a searchable conversion history.

## Main Features
- Signup (validation, duplicate-email check) and Login with localStorage-based session
- Logout and Vue Router navigation guards (`/dashboard`, `/converter`, `/history` are protected)
- Dashboard: total conversions, most used source/target currency, last used pair, recent conversions
- Converter: live result as amount/currencies change, swap button, exchange rate display, currency-symbol formatting, validation (numeric, non-negative, same-currency handling, unavailable-rate handling)
- History (full CRUD): search (code or name), filter (currency pair, date), sort (newest/oldest/highest/lowest), **View** details, **Edit** (amount / currencies, validated, with live preview), **Delete** one (confirmation modal), clear all (confirmation modal), optional sample data
- 33 currencies with flags and a searchable currency picker; dashboard coins and rate chips open the converter with that currency pre-selected
- Refresh button reloads rates and tells you whether new rates arrived (the provider updates once a day)
- Loading, error, empty and success states; responsive for desktop, tablet and mobile

## UI / UX
- Clean light theme (soft green/white) with a gently animated background, compact fonts and buttons, and animated cards (hover lift + light sweep), buttons (shine) and list rows
- Split-screen Login/Signup (Login and Signup pages only) with a 3D coins banner: green $ coins spin and fall around a phone mockup that tilts toward the cursor, cycles through sample conversions and shows a lock screen while a password is being typed
- Dashboard has a scrolling exchange-rate ticker (live API with sample fallback)
- Page transitions, count-up dashboard stats, animated list/table rows, floating-label inputs, modal and button micro-interactions
- Respects `prefers-reduced-motion`

## Technologies
Vue 3 (`<script setup>`), Pinia, Vue Router 4, Vite, plain CSS, localStorage

## Installation & Run
```bash
npm install
npm run dev      # development server (http://localhost:5173)
npm run build    # production build
npm run preview  # preview production build
```
Demo account (auto-created on first run): `demo@example.com` / `demo123`

## Data Source
Rates (33 currencies) are fetched from the free public API `https://open.er-api.com/v6/latest/USD` (loading state + error handling).
If the API is unreachable, the app falls back to **local sample rates** (clearly labelled as demonstration data, not market rates) in `src/utils/currencies.js`.

## Important Calculation
All rates are relative to USD. For `from → to`:
`rate = rates[to] / rates[from]`, `converted = amount × rate`.

## localStorage Keys
- `users` – registered users (demo only; storing passwords in localStorage is NOT secure)
- `currentUser` – current session
- `conversionHistory_<email>` – saved conversions (kept separately for every user)
- `rememberedEmail` – only when "Remember me" is ticked

## Structure
```
src/
├── assets/main.css
├── components/ Navbar, BrandLogo, CoinScene, AuthLayout, FormField, CountUp, RateTicker, DashboardStats, CurrencyCard, DeleteModal
├── views/      Signup, Login, Dashboard, Converter, History
├── router/index.js     (routes + guards)
├── stores/     authStore.js, currencyStore.js
├── utils/currencies.js (currency list, sample rates, formatters)
├── App.vue
└── main.js
```
