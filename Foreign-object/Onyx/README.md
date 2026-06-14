# Onyx ✦ Food Marketplace

Dark luxury food marketplace built with **Expo SDK 54 + Supabase Auth**.

---

## 🚀 Quick Start

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → New Project
2. Dashboard → **SQL Editor** → paste & run `SUPABASE_SETUP.sql`
3. Dashboard → **Project Settings → API** → copy:
   - **Project URL**
   - **anon public** key

### 2. Add Your Keys
Open `.env` and replace the placeholders:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

### 3. Install & Run
```bash
npm install
npx expo start
```
Scan the QR with **Expo Go** on your phone.

---

## 📁 Project Structure

```
OnyxApp/
├── .env                          ← ⚠️ Add your Supabase keys here
├── .env.example                  ← Template
├── App.js                        ← Root: auth gate + navigation
├── babel.config.js
├── package.json
├── SUPABASE_SETUP.sql            ← Run in Supabase SQL Editor
└── src/
    ├── lib/
    │   └── supabase.js           ← Supabase client (reads .env)
    ├── hooks/
    │   ├── useAuth.js            ← Auth context (signIn/signUp/signOut)
    │   └── useStore.js           ← Company + menu + cart state
    ├── data/
    │   └── seed.js               ← Demo companies & menu items
    ├── utils/
    │   └── theme.js              ← Colors, spacing, gradients
    ├── components/
    │   └── UI.js                 ← Shared components
    └── screens/
        ├── LoginScreen.js        ← Index/entry screen ← Auth
        ├── SignupScreen.js       ← Registration ← Auth
        ├── MarketplaceScreen.js  ← Browse dishes (search, filter, sort)
        ├── CompaniesScreen.js    ← Store listings
        ├── MyCompanyScreen.js    ← Register, add items, manage, edit
        └── OtherScreens.js      ← DishDetail, StoreDetail, Cart, EditItem
```

---

## ✅ Features

| Feature | Status |
|---|---|
| Login / Signup via Supabase Auth | ✅ |
| Session persistence (AsyncStorage) | ✅ |
| Auth gate — app locked behind login | ✅ |
| Company Registration | ✅ |
| Menu Item Upload (company-only) | ✅ |
| Marketplace with search + filter + sort | ✅ |
| Grid / List view toggle | ✅ |
| Cuisine category filter | ✅ |
| Store filter strip | ✅ |
| Companies listing page | ✅ |
| Dish detail + related items | ✅ |
| Store detail with full menu | ✅ |
| Cart + checkout | ✅ |
| Edit / Delete menu items | ✅ |
| Demo data (5 companies, 12 dishes) | ✅ |

---

## 🔐 Auth Flow

```
App Launch
  └── authReady?  No → Loading splash
  └── session?    No → Login / Signup screens
  └── session?    Yes → Marketplace (tabs)
```

Supabase handles email/password auth. On signup, a profile row is created in the `profiles` table. The Supabase trigger `on_auth_user_created` also creates it automatically as a fallback.
