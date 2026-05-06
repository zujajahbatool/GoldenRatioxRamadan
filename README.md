# 🌙 GoldenRatio×Ramadan

> Your precision kitchen vault for Ramadan — a smart recipe assistant built with love for the blessed month.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%7C%20Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Live Demo

🔗 **[goldenratioxramadan-c12db.web.app](https://goldenratioxramadan-c12db.web.app)**

---

## 📖 About

**GoldenRatio×Ramadan** is a Ramadan-exclusive kitchen assistant web app that solves a culturally specific problem no general recipe app addresses: managing Suhoor, Iftar, and Dessert recipes with live prayer-time countdowns, proportional serving-size scaling, and hands-free voice I/O — all wrapped in an elegant, Ramadan-themed glassmorphism design.

The "Golden Ratio" in the name reflects the core promise: proportional, mathematically precise ingredient scaling that keeps your recipes perfectly balanced at any serving size.

---

## 🚀 Features

### 🍽️ Recipe Vault
- **Categorized Tabs** — Browse recipes by Suhoor 🌅, Iftar 🌙, or Dessert 🍮
- **Glassmorphism Cards** — Modern card design with backdrop blur and gold-on-emerald palette
- **Recipe Modal** — Full recipe details with scaled ingredients and step-by-step instructions
- **Add/Delete Recipes** — Rich form with name, category, servings, ingredients, steps, and mode
- **Download as Text** — Export any recipe (with current scaled quantities) as a formatted `.txt` file

### ⚖️ Golden Ratio Serving-Size Scaler
- **Live Scaling on Cards** — Adjust servings directly on the recipe card; all ingredient quantities update instantly
- **Live Scaling in Read Modal** — The same scaler is available in the full read view
- **Proportional Precision** — Fractional results preserved (e.g. `1.67 cups`) with no rounding errors
- **Reset Button** — One click to return to the base serving size
- **Visual Active State** — Card border highlights gold when a recipe is scaled away from its base

### 🕌 Dual Live Prayer-Time Countdown
- **Iftar & Suhoor Timers** — Switchable countdown between Maghrib (Iftar) and Fajr (Suhoor)
- **Real Prayer Data** — Times fetched daily from the [Aladhan API](https://aladhan.com/prayer-times-api)
- **Editable City** — Tap the city pill in the header to change location inline; times refresh automatically
- **Midnight Auto-Refresh** — Fetches fresh prayer times at midnight without a page reload
- **Glow Animation** — Timer pulses with a golden glow when it's Iftar or Suhoor time

### 🔐 Firebase Authentication
- **Email/Password Sign Up** — Create a personal account with display name
- **Login** — Securely access your saved recipes from any device
- **Logout** — End your session safely
- **Guest Mode** — Browse three curated sample recipes without creating an account
- **Friendly Error Messages** — Human-readable auth error mapping for all common Firebase error codes

### ☁️ Firestore Cloud Storage with Optimistic UI
- **Per-User Collections** — Each user's recipes are stored privately in Firestore
- **Optimistic Updates** — Recipes appear in the UI instantly on save; silently rolls back if the network write fails
- **Real-Time on Login** — Recipes load ordered by creation time on auth state change
- **Persistent Data** — Your vault is safe in the cloud across sessions and devices

### 🎙️ Voice Input (Speech-to-Text)
- **Microphone Button** — Dictate recipe names and cooking steps hands-free
- **Continuous Mode for Steps** — The mic stays open for multi-sentence step dictation
- **Web Speech API** — Uses the browser's built-in speech recognition (Chrome / Edge)
- **Live Indicator** — Red mic icon shows when recording is active; tap again to stop

### 🔊 Text-to-Speech Playback
- **Listen Button** — Hear any recipe read aloud, including *scaled* ingredient quantities
- **Play/Stop Toggle** — Control playback with a single button
- **Hands-Free Cooking** — Perfect for when your hands are covered in dough
- **Auto-cancel on Delete/Logout** — Playback stops cleanly when a recipe is removed or the session ends

### 🔒 Security & Validation
- **Input Sanitization** — All user input is trimmed and hard-limited (name: 120 chars, steps: 5000 chars, unit: 20 chars, max 30 ingredients)
- **City Sanitization** — City field strips non-letter characters; prevents injection into API requests
- **Numeric Guards** — Ingredient amounts clamped to `[0, 99999]`; NaN values default to 0
- **Allowed-list Validation** — Category and mode values validated against an explicit allow-list before saving
- **Firestore Delete Guard** — UI state only updates after a confirmed Firestore delete; aborts on error

### 🎨 Premium UI/UX
- **Emerald & Gold Theme** — Ramadan-inspired colour palette across every component
- **Ramadan Lantern Background** — Immersive fixed background with a dark overlay for legibility
- **Glassmorphism Design** — `backdrop-filter: blur` on cards, header, and modals
- **Responsive Layout** — Breakpoints at 1199px, 767px, 599px, 479px, 359px, and `max-height: 650px` (landscape phones, Nest Hub)
- **Smooth Animations** — Hover lifts, glow pulses, and micro-interactions throughout
- **Focus-Visible Styles** — Every interactive element has explicit `:focus-visible` outlines for keyboard accessibility
- **Custom Fonts** — Playfair Display (headings) + DM Sans (body)
- **Custom Scrollbars** — Styled globally with gold-on-dark palette

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, JSX |
| **Build Tool** | Vite 8 + Rolldown |
| **Styling** | Vanilla CSS (Glassmorphism, CSS Variables, no framework) |
| **Authentication** | Firebase Auth (Email/Password) |
| **Database** | Cloud Firestore |
| **Hosting** | Firebase Hosting |
| **Prayer Times** | [Aladhan API](https://aladhan.com/prayer-times-api) |
| **Voice Input** | Web Speech Recognition API |
| **Text-to-Speech** | Web Speech Synthesis API |
| **Minification** | Terser |

---

## 📁 Project Structure

```
golden-ratio-ramadan/
├── public/
│   ├── favicon.svg                   # Custom SVG favicon
│   └── icons.svg                     # Icon sprite sheet
├── src/
│   ├── assets/
│   │   └── ramadan_background.jpg    # Background image
│   ├── App.jsx                       # Main application component (~700 LOC)
│   ├── App.css                       # Full design system (glassmorphism, tokens, responsive)
│   ├── firebase.js                   # Firebase initialization & named exports
│   ├── index.css                     # Global base styles
│   └── main.jsx                      # React entry point
├── .env                              # Firebase credentials (not committed)
├── .env.example                      # Credential template
├── .firebaserc                       # Firebase project alias
├── firebase.json                     # Firebase Hosting + SPA rewrite config
├── index.html                        # HTML entry + CSP meta + font preloads
├── LICENSE                           # MIT License
├── package.json                      # Dependencies & scripts
└── vite.config.js                    # Vite config with chunking & Terser
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- A Firebase project with **Authentication** and **Firestore** enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/zujajahbatool/GoldenRatioxRamadan.git
cd GoldenRatioxRamadan

# Install dependencies
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run Locally

```bash
npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in /dist — minified via Terser, vendor chunks split automatically
```

### Deploy to Firebase

```bash
firebase login
firebase deploy --only hosting
```

---

## 🔧 Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication under **Authentication → Sign-in method**
3. Create a **Cloud Firestore** database in production mode
4. Register a **Web App** and copy the config to your `.env` file
5. Enable **Firebase Hosting** under **Build → Hosting**

### Firestore Data Model

```
users/
  {uid}/
    recipes/            ← ordered by createdAt desc
      {docId}/
        name            string
        category        "suhoor" | "iftar" | "dessert"
        servings        number
        steps           string
        mode            "both" | "read" | "listen"
        ingredients[]   { item, amount, unit }
        createdAt       number (epoch ms)
```

---

## 📱 Responsive Design

Breakpoints cover the full device spectrum:

| Breakpoint | Target |
|-----------|--------|
| `> 1199px` | Desktop — full layout |
| `768–1199px` | Laptop / large tablet |
| `≤ 767px` | Tablet — grid nav layout |
| `≤ 599px` | Mobile — stacked single column |
| `≤ 479px` | Small phones |
| `≤ 359px` | Ultra-small Android (e.g. Galaxy A series) |
| `max-height: 650px` | Landscape phones, Google Nest Hub |

---

## 🌟 Acknowledgments

- [Aladhan Prayer Times API](https://aladhan.com/) — For accurate, city-based prayer time data
- [Firebase](https://firebase.google.com/) — For authentication, Firestore, and hosting
- [Vite](https://vite.dev/) — For blazing-fast development experience
- Inspired by the spirit of Ramadan 🌙

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <b>✦ ── ── ── ✦</b><br>
  Made with 💛 for Ramadan<br>
  <b>GoldenRatio×Ramadan</b>
</p>
