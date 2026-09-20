# 🎓 Trust Lesson

> **Your Knowledge. On-Chain.**  
> A decentralized, peer-to-peer mentorship and milestone gig exchange protected by non-custodial smart escrow contracts on **Arbitrum One**.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![Built with React](https://img.shields.io/badge/Frontend-React%2019-61dafb.svg)](https://react.dev)
[![Powered by Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF.svg)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg)](https://tailwindcss.com)
[![Network: Arbitrum](https://img.shields.io/badge/Network-Arbitrum%20One-28A0F0.svg)](https://arbitrum.io)
[![Security Policy](https://img.shields.io/badge/Security-Policy%20Enforced-emerald.svg)](./SECURITY.md)

---

## 🌟 Overview

**Trust Lesson** is designed to eliminate payment risk and ghosting in private mentorship and freelance coaching. By combining milestone-based escrow vaults with on-chain reputation verification, learners can book sessions with confidence and mentors are guaranteed instant, automated payouts upon verified delivery.

### 🛡️ Why Trust Lesson?
- **Zero-Risk Escrow**: Funds are locked in smart contracts until the learner approves the milestone deliverables.
- **100% Satisfaction Guarantee**: Automated refunds if a session is cancelled or a mentor fails milestone terms.
- **Decentralized Reputation**: Completion rates and verified feedback are permanently attached to learner and mentor profiles.
- **Lesson Monster Universe**: A fun, purple-themed, gamified aesthetic with friendly mascot guides throughout your learning journey.

---

## 🚀 Key Features

### 1. 🧑‍🏫 Mentor Hub & Workspace
- **Sub-Navigation Tabs**:
  - **Overview**: Monthly earnings, active escrow pool, on-chain reputation score, and hourly rate analytics.
  - **Courses & Gigs**: Manage published learning packages and create milestone-driven gigs.
  - **Mandatory Video Verification**: Mentors must upload a course introduction video with instant client-side video playback preview before publishing.
  - **Escrow Wallet**: View pending escrow funds, payout history, and withdraw settled USDC to connected Web3 wallets.
  - **In-App Portfolio Writer**: Write, showcase, and edit personal projects, live demos, GitHub repositories, and tech stacks directly in your profile.

### 2. 🎓 Student Workspace
- **Sub-Navigation Tabs**:
  - **Overview**: Active bookings summary and 100% escrow protection guarantee.
  - **My Courses**: Track multi-stage milestone progression (*1. Escrow Deposited → 2. Deliverables Underway → 3. Verified & Released*).
  - **Release & Dispute Engine**: One-click escrow fund release upon milestone completion, or dispute escalation to decentralized community arbitration.
  - **Profile & Learning Goals**: Editable learner profile with target skill focus areas and verified completion credentials.

### 3. 📱 Mobile & Android Responsive
- Dedicated mobile slide-down drawer with large touch targets.
- Responsive hamburger menu (`Menu` / `X`) tested for mobile browsers and Android devices.
- Seamless viewport adaptability across all screens.

### 4. 🗄️ Local Database & Schema Persistence
- Client-side database powered by **IndexedDB** (`TrustLesson_LocalDB`) with automatic fallback to `localStorage`.
- Explicit schema models for `Users`, `Gigs`, `Sessions`, `Portfolios`, and `Wallets`.
- Heavy binary files (such as video recordings) are excluded from the database schema to protect storage performance and browser quotas.

---

## 🛠️ Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Local Database** | Native Browser IndexedDB (`TrustLesson_LocalDB`) |
| **Web3 & Escrow** | EIP-1193 Web3 Provider / MetaMask + Arbitrum One Escrow |

---

## 📂 Project Structure

```text
Trust-Lesson/
├── public/
│   ├── monsters/            # 11 Lesson Monster character assets
│   ├── landing-page.png     # Hero section background artwork
│   ├── login.png            # Fantasy academy sky island background
│   ├── logo-full-white.png  # Header & footer brand logo
│   └── logo.png             # Auth pages & favicon
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Responsive header with mobile drawer
│   │   ├── Footer.jsx       # Multi-column ecosystem footer
│   │   ├── ExploreCard.jsx  # Interactive catalog offering cards
│   │   ├── CategoryChips.jsx# Themed category filter pills
│   │   ├── EscrowBadge.jsx  # Status badge for smart escrow states
│   │   └── WalletConnectCard.jsx # Web3 Arbitrum wallet connection card
│   ├── context/
│   │   └── AuthContext.jsx  # User, session, course, wallet, & portfolio state
│   ├── db/
│   │   ├── schema.js        # Data schemas (User, Gig, Session, Portfolio, Wallet)
│   │   └── localDb.js       # IndexedDB persistence layer
│   ├── pages/
│   │   ├── LandingPage.jsx  # Homepage with hero & monster features
│   │   ├── ExplorePage.jsx  # Searchable marketplace catalog
│   │   ├── BookingPage.jsx  # Dedicated checkout & Escrow Guardian mascot
│   │   ├── DashboardPage.jsx# Mentor & Student workspace views
│   │   ├── AboutPage.jsx    # Vision, story, & leadership team
│   │   ├── LoginPage.jsx    # Fantasy login screen with companion monsters
│   │   └── RegisterPage.jsx # Multi-step role onboarding
│   ├── App.jsx              # Application router
│   ├── index.css            # Tailwind CSS v4 & custom animations
│   └── main.jsx             # React DOM root entry
├── LICENSE                  # MIT License
├── README.md                # Project documentation
├── SECURITY.md              # Vulnerability disclosure & escrow safety
└── package.json             # Project metadata & dependencies
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/zhao-leihan/Trust-Lesson.git
   cd Trust-Lesson
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 👥 Leadership & Team

- **Rayhan Young** — *Founder & Product Architect*
- **0xAnakMommy** — *Lead Blockchain & Fullstack Developer*

---

## 📄 License & Security

- **License**: Released under the [MIT License](./LICENSE).
- **Security Policy**: For vulnerability reporting and escrow contract disclosures, please review [SECURITY.md](./SECURITY.md).
