<div align="center">
<img width="1200" height="475" alt="ReptileGuard Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🦎 ReptileGuard

**Reptile Identification and Management System for Peri-Urban Wildlife Conservation**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?logo=firebase)](https://firebase.google.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Configuration](#-configuration) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📖 About

ReptileGuard is a comprehensive wildlife conservation platform that helps citizens identify reptiles and coordinate rescue operations with wildlife officers. Using AI-powered image recognition (Google Gemini), the system provides instant species identification, safety guidance, and streamlined reporting workflows.

## ✨ Features

- 🔍 **AI-Powered Identification** - Upload images for instant reptile species identification using Google Gemini AI
- ⚠️ **Safety Guidance** - Get immediate precautions and danger level assessments
- 📋 **Sighting Reports** - Submit detailed sighting reports with location and risk information
- 👮 **Officer Dashboard** - Wildlife officers can manage and track rescue operations
- 📧 **Email Notifications** - Automatic alerts to nearby wildlife officers
- 📄 **PDF Reports** - Generate downloadable PDF reports for records
- 🌓 **Dark/Light Theme** - Toggle between themes for comfortable viewing
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔐 **User Authentication** - Secure login with Firebase Authentication

## 🎯 Demo

> _Add your deployed demo link here after deployment_

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Firebase Account](https://firebase.google.com/)
- [Google AI Studio Account](https://makersuite.google.com/) (for Gemini API)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShashankRB031/Reptile_Guard.git
   cd Reptile_Guard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your API keys (see [Configuration](#-configuration))

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## ⚙️ Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-your_measurement_id

# EmailJS Configuration (optional - for notifications)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Getting API Keys

| Service | How to Get |
|---------|------------|
| **Gemini API** | Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and create an API key |
| **Firebase** | Create a project at [Firebase Console](https://console.firebase.google.com/), go to Project Settings > General |
| **EmailJS** | Sign up at [EmailJS](https://www.emailjs.com/) (free tier: 200 emails/month) |

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check
npm run lint
```

The build output will be in the `dist` folder, ready for deployment to any static hosting service.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Build Tool** | Vite 6 |
| **AI/ML** | Google Gemini AI |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **Maps** | Leaflet, React-Leaflet |
| **PDF Generation** | jsPDF |
| **Email** | EmailJS |
| **Icons** | Lucide React |

## 📁 Project Structure

```
reptile-guard/
├── components/          # React components
│   ├── Dashboard.tsx    # Officer/user dashboard
│   ├── LandingPage.tsx  # Auth & landing page
│   ├── Navbar.tsx       # Navigation bar
│   ├── ReportCard.tsx   # Sighting report card
│   ├── ReptileIdentifier.tsx  # AI identification
│   └── ...
├── contexts/            # React contexts
│   └── ThemeContext.tsx # Dark/light theme
├── services/            # API & backend services
│   ├── firebase.ts      # Firebase config
│   ├── geminiService.ts # Gemini AI integration
│   ├── emailService.ts  # Email notifications
│   └── ...
├── public/              # Static assets
├── App.tsx              # Main app component
├── types.ts             # TypeScript types
├── constants.ts         # UI text & constants
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for powering reptile identification
- [Firebase](https://firebase.google.com/) for backend services
- [Lucide](https://lucide.dev/) for beautiful icons

---

<div align="center">

**Made with ❤️ for Wildlife Conservation**

⭐ Star this repo if you find it helpful!

</div>
