# 🌙 GoldenRatio×Ramadan

> Your precision kitchen vault for Ramadan — a smart recipe assistant built with love for the blessed month.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%7C%20Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black)

## ✨ Live Demo

🔗 **[goldenratioxramadan-c12db.web.app](https://goldenratioxramadan-c12db.web.app)**

---

## 📖 About

**GoldenRatio×Ramadan** is a Ramadan kitchen assistant web app that helps you organize, scale, and access your recipes during the holy month. Whether you're preparing Suhoor, Iftar, or Dessert — this app keeps your recipes at your fingertips with voice support, live Iftar countdowns, and cloud-synced storage.

---

## 🚀 Features

### 🍽️ Recipe Vault
- **Categorized Tabs** — Browse recipes by Suhoor 🌅, Iftar 🌙, or Dessert 🍮
- **Glassmorphism Cards** — Beautiful, modern card design with backdrop blur effects
- **Recipe Modal** — Full recipe details with ingredients and step-by-step instructions
- **Add/Delete Recipes** — Create custom recipes with a rich form (name, category, servings, ingredients, steps)
- **Download as Text** — Export any recipe as a formatted `.txt` file

### ⚖️ Serving Size Scaler
- **Dynamic Scaling** — Adjust servings up or down with instant ingredient recalculation
- **Golden Ratio Math** — Proportional scaling keeps your recipes perfectly balanced
- **Reset Button** — One click to return to the original serving size

### 🕌 Real-Time Iftar Countdown
- **Live Timer** — Countdown to Maghrib/Iftar based on **Faisalabad, Pakistan** prayer times
- **Aladhan API** — Real prayer time data fetched daily
- **Glow Animation** — The timer pulses with a golden glow when it's Iftar time!

### 🔐 Firebase Authentication
- **Email/Password Sign Up** — Create a personal account with your name
- **Login** — Securely access your saved recipes from any device
- **Logout** — End your session safely
- **Guest Mode** — Browse sample recipes without creating an account
- **Friendly Error Messages** — Human-readable auth error handling

### ☁️ Firestore Cloud Storage
- **Per-User Collections** — Each user's recipes are stored privately in Firestore
- **Real-Time Sync** — Recipes load automatically on login
- **Persistent Data** — Your recipes are safe in the cloud across sessions and devices

### 🎙️ Voice Input (Speech-to-Text)
- **Microphone Button** — Dictate recipe names and cooking steps hands-free
- **Web Speech API** — Uses the browser's built-in speech recognition
- **Live Indicator** — Red mic icon shows when recording is active

### 🔊 Text-to-Speech Playback
- **Listen Button** — Hear any recipe read aloud including scaled ingredients
- **Play/Stop Toggle** — Control playback with a single button
- **Hands-Free Cooking** — Perfect for when your hands are covered in dough!

### 🎨 Premium UI/UX
- **Emerald & Gold Theme** — Elegant color palette inspired by Ramadan aesthetics
- **Ramadan Lantern Background** — Immersive background imagery
- **Glassmorphism Design** — Frosted glass effects on cards, header, and modals
- **Responsive Layout** — Works beautifully on desktop, tablet, and mobile
- **Smooth Animations** — Hover effects, transitions, and micro-interactions
- **Custom Fonts** — Playfair Display + DM Sans typography

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, JSX |
| **Build Tool** | Vite 8 |
| **Styling** | Vanilla CSS (Glassmorphism, CSS Variables) |
| **Authentication** | Firebase Auth (Email/Password) |
| **Database** | Cloud Firestore |
| **Hosting** | Firebase Hosting |
| **Prayer Times** | [Aladhan API](https://aladhan.com/prayer-times-api) |
| **Voice Input** | Web Speech Recognition API |
| **Text-to-Speech** | Web Speech Synthesis API |

---

## 📁 Project Structure

```
golden-ratio-ramadan/
├── public/
├── src/
│   ├── assets/
│   │   └── ramadan_background.jpg    # Background image
│   ├── App.jsx                       # Main application component
│   ├── App.css                       # All styles (design system)
│   ├── firebase.js                   # Firebase initialization & exports
│   ├── index.css                     # Global base styles
│   └── main.jsx                      # React entry point
├── .env                              # Firebase credentials (not committed)
├── .firebaserc                       # Firebase project alias
├── firebase.json                     # Firebase Hosting configuration
├── index.html                        # HTML entry point
├── package.json                      # Dependencies & scripts
└── vite.config.js                    # Vite configuration
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A Firebase project with **Authentication** and **Firestore** enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/zujajahbatool/GoldenRatioxRamadan.git
cd GoldenRatioxRamadan/golden-ratio-ramadan

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root with your Firebase credentials:

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
```

The app will start at `http://localhost:5173`.

### Build for Production

```bash
npm run build
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

---

## 📱 Responsive Design

The app is fully responsive and optimized for:
- 🖥️ **Desktop** — Full layout with side-by-side header elements
- 📱 **Tablet** — Adaptive grid and wrapped navigation
- 📱 **Mobile** — Stacked layout with touch-friendly buttons

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

 golden-ratio-ramadan/
 ├── public/
 ├── src/
 │   ├── assets/
 │   │   └── ramadan_background.jpg    # Background image
 │   ├── App.jsx                       # Main application component
 │   ├── App.css                       # All styles (design system)
 │   ├── firebase.js                   # Firebase initialization & exports
 │   ├── index.css                     # Global base styles
 │   └── main.jsx                      # React entry point
 ├── .env                              # Firebase credentials (not committed)
 ├── .firebaserc                       # Firebase project alias
 ├── firebase.json                     # Firebase Hosting configuration
 ├── index.html                        # HTML entry point
 ├── LICENSE                           # MIT License
 ├── package.json                      # Dependencies & scripts
 └── vite.config.js                    # Vite configuration

---

## 🌟 Acknowledgments

- [Aladhan Prayer Times API](https://aladhan.com/) — For accurate prayer time data
- [Firebase](https://firebase.google.com/) — For authentication, database, and hosting
- [Vite](https://vite.dev/) — For blazing-fast development experience
- Inspired by the spirit of Ramadan 🌙

---

<p align="center">
  <b>✦ ── ── ── ✦</b><br>
  Made with 💛 for Ramadan<br>
  <b>GoldenRatio×Ramadan</b>
</p>
