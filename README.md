<!-- ═══════════ ANIMATED HEADER ═══════════ -->

# 🚀 Spenza

<div align="center">
<!-- ═══════════ DEMO LINK ═══════════ -->
**Demo Live:** [https://spendinspenza.vercel.app/](https://spendinspenza.vercel.app/)

<br/>

<!-- ═══════════ BADGES ═══════════ -->
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
&nbsp;
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
&nbsp;
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
&nbsp;
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
&nbsp;
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br/>

![Repo Size](https://img.shields.io/github/repo-size/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system?style=flat-square&color=6AD3F7&label=Repo+Size)
&nbsp;
![Last Commit](https://img.shields.io/github/last-commit/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system?style=flat-square&color=58A6FF&label=Last+Commit)
&nbsp;
![License](https://img.shields.io/github/license/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system?style=flat-square&color=27AE60)
&nbsp;
![Stars](https://img.shields.io/github/stars/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system?style=social)
&nbsp;
![Forks](https://img.shields.io/github/forks/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system?style=social)

</div>

---

## 🌊 What is Spenza?

**Spenza** is a fast, transparent, and delightful expense management application for friends, roommates, and travel groups. Built with Next.js 15 and modern web technologies, it removes the friction of splitting bills.

Whether you're organizing a road trip, managing shared apartment bills, or just grabbing dinner with friends — **Spenza** has you covered.

> *"The smartest way to split expenses. Stop doing math and start enjoying the moment."*

### ✨ Core Philosophy
- 🎯 **Simplicity first** — elegant UI, zero clutter, lightning-fast expense entry
- ⚡ **Speed** — sub-100ms calculations and optimized bundle size
- 📊 **Clarity** — interactive settlement graphs and balance displays

---

## 🚀 Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| ⚡ **Fast Expense Entry** | Add expenses and split them in under 30 seconds | ✅ Active |
| 🎯 **Flexible Splitting** | Weighted distribution with partial participation | ✅ Active |
| 📊 **Clear Visualizations** | Interactive settlement graphs and real-time balance displays | ✅ Active |
| 💾 **Dual Storage** | Local storage for anonymous users, Supabase for authenticated users | ✅ Active |
| 📱 **Mobile Optimized** | Touch-friendly progressive web app (PWA) with responsive design | ✅ Active |
| 🌙 **Theme Support** | Beautiful Light, Dark, and System theme modes | ✅ Active |

</div>

---

## 🛠️ Tech Stack

<div align="center">

### 💻 Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### 🧠 Backend & Storage
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### 🔧 Tools & DevOps
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</div>

---

## 🗂️ Project Structure

```
📦 Spenza/
├── 📁 src/
│   ├── 📁 app/           ← Next.js App Router (pages & layouts)
│   ├── 📁 components/    ← UI, Expense, Group, and Settlement components
│   ├── 📁 lib/           ← Algorithms, Storage, Themes, and Validation
│   └── 📁 hooks/         ← Custom React Hooks
├── 📄 next.config.mjs    ← Next.js Configuration
├── 📄 tailwind.config.js ← Tailwind CSS Configuration
└── 📖 README.md          ← Project Documentation
```

---

## ⚙️ Architecture Overview

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "background":         "#0a0e1a",
    "primaryColor":       "#1a1a2e",
    "primaryTextColor":   "#6AD3F7",
    "primaryBorderColor": "#58A6FF",
    "lineColor":          "#58A6FF",
    "secondaryColor":     "#16213e",
    "tertiaryColor":      "#0f3460",
    "fontFamily":         "Fira Code, monospace"
  }
}}%%
flowchart LR
    A["👤 User Input"] --> B["Next.js Frontend\n(React 19)"]
    B --> C{"Storage Engine"}
    C -->|Anonymous| D["Local Storage\n(IndexedDB)"]
    C -->|Authenticated| E["Supabase\n(PostgreSQL + Realtime)"]
    D --> F["🧮 Settlement Calculation Engine"]
    E --> F
    F --> G["📊 Dashboard & Visualizations"]
```

---

## 🚦 Quick Start

### Prerequisites

```bash
# Make sure you have Node.js 18+ installed
node --version

# Install dependencies
npm install
```

### 🖥️ Run the Web Interface

```bash
# 1. Clone the repository
git clone https://github.com/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system.git

# 2. Navigate to the project directory
cd Spenza-_-roommate-tour_Spliting_management_system

# 3. Setup Environment Variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start the development server
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the app!

---

## 📸 Interface Preview

<div align="center">

> 🌙 **Sleek, accessible, and responsive UI** — designed for absolute clarity.

```
┌──────────────────────────────────────────┐
│                                          │
│    Spenza  |  Dashboard                  │
│                                          │
│   ┌────────────────────────────────┐     │
│   │ Total Group Expenses: $450.00  │     │
│   └────────────────────────────────┘     │
│                                          │
│    [ + Add Expense ]  [ Settle Up ]      │
│                                          │
└──────────────────────────────────────────┘
```

</div>

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Here's how you can help:

```bash
# 1. Fork the repository on GitHub
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m '✨ Add AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request 🎉
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author

<div align="center">

### **Umang Pandey**
*Software Developer · UI/UX Enthusiast*

[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:umangpandey.co@gmail.com)
&nbsp;
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/umang-pandey-01b486273/)
&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Umangpandey75)
&nbsp;
[![Portfolio](https://img.shields.io/badge/Portfolio-6AD3F7?style=for-the-badge&logo=vercel&logoColor=black)](https://umangpandey.vercel.app/)

*"Query the data. Build the insight. Ship the WOW. ✨"*

</div>

---

## ⭐ Show Your Support

If **Spenza** helped you or your roommates, please give it a ⭐ — it means the world!

<div align="center">

[![Star this repo](https://img.shields.io/badge/⭐_Star_this_repo-FFD700?style=for-the-badge)](https://github.com/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system/stargazers)
&nbsp;
[![Fork this repo](https://img.shields.io/badge/🍴_Fork_it-58A6FF?style=for-the-badge)](https://github.com/Umangpandey75/Spenza-_-roommate-tour_Spliting_management_system/fork)

</div>
---
<!-- ═══════════ FOOTER WAVE ═══════════ -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,40:16213e,70:1a1a2e,100:0d1117&height=120&section=footer" width="100%"/>

<div align="center">

*Created by [Umang Pandey](https://github.com/Umangpandey75) · © 2026 Spenza*

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Umangpandey75.Spenza-_-roommate-tour_Spliting_management_system&left_color=1F6FEB&right_color=6AD3F7&left_text=Visitors)
</div>
