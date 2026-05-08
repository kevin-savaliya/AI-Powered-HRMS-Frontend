# 🏢 AI-Powered HRMS - Frontend

🚀 A state-of-the-art, full-stack Human Resource Management System that leverages Generative AI to automate recruitment, streamline employee management, and provide instant policy support through a RAG-powered chatbot.

## 🌟 Features

### Core Features
- **Role-Based Dashboards**: Customized interfaces for **Admins**, **HR Managers**, and **Employees**.
- **Employee Management**: Comprehensive CRUD operations for employee profiles, personal details, and job history.
- **Attendance & Leave Tracking**: Real-time attendance monitoring with streamlined leave application and approval workflows.
- **Performance Analytics**: Visual tracking of employee growth and department performance using interactive charts.

### Advanced AI Features
- **RAG Chatbot**: An intelligent AI assistant built with **Google Gemini Pro** and **Retrieval-Augmented Generation (RAG)** to answer complex company policy questions instantly.
- **Automated Recruitment**: A visual hiring pipeline (Kanban-style) for tracking candidates from application to onboarding.
- **Knowledge Base Integration**: Dynamic policy ingestion where PDFs/DOCs are indexed for AI retrieval.
- **Smart Data Visualization**: Interactive reporting using **Recharts** for workforce distribution and hiring metrics.

### UI/UX Features
- **Premium Design System**: Modern aesthetic using **Tailwind CSS 4.0** with custom color palettes and smooth transitions.
- **Mobile First & Responsive**: Fully optimized experience across mobile, tablet, and desktop screens.
- **Glassmorphism & Micro-animations**: Subtle visual effects for a high-end, professional feel.
- **Lucide Icon Integration**: Consistent and clear iconography across the entire platform.

## 🏗️ System Architecture
```
+---------------------------------------------------------------+
|                         CLIENT LAYER                          |
|                     (React.js Frontend)                       |
|   +-------------+   +-------------+   +-------------+         |
|   | Admin Panel |   | HR Dashboard|   | AI Chatbot  |         |
|   +-------------+   +-------------+   +-------------+         |
+---------------------------------------------------------------+
                            ↓ HTTP / REST API
+---------------------------------------------------------------+
|                      INTELLIGENCE LAYER                       |
|                    (AI/ML Processing)                         |
|   +-------------------------------------------------------+   |
|   |                 Google Gemini Pro API                 |   |
|   | Input: User Query → Vector Search → AI Generation     |   |
|   | Output: Policy-accurate response                       |   |
|   +-------------------------------------------------------+   |
+---------------------------------------------------------------+
                            ↓
+---------------------------------------------------------------+
|                         DATA LAYER                            |
|             (FastAPI Backend / Supabase Storage)              |
|   +--------------+   +-------------+   +-------------+        |
|   | User Roles   |   | Policy Docs |   | Employee    |        |
|   | Auth Data    |   | Knowledge   |   | Records     |        |
|   +--------------+   +-------------+   +-------------+        |
+---------------------------------------------------------------+
```

## 🛠 Tech Stack

### Frontend (React)
- **Framework**: [React 19](https://react.dev/) with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API
- **Charts**: [Recharts](https://recharts.org/)
- **AI Integration**: Google Generative AI (Gemini SDK)
- **HTTP Client**: Axios

## 📂 Project Structure
```
Frontend/
├── src/
│   ├── api/          # API services (Axios)
│   ├── components/   # Reusable UI components
│   ├── context/      # Auth and Global state
│   ├── pages/        # Dashboard and feature pages
│   ├── lib/          # AI and Supabase logic
│   ├── utils/        # Helper functions
│   ├── types.ts      # TypeScript definitions
│   └── App.tsx       # Main routing logic
├── public/           # Static assets
└── tailwind.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kevin-savaliya/AI-Powered-HRMS-Frontend.git
   cd AI-Powered-HRMS-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📂 Repository Links
- **Frontend**: [GitHub Repo](https://github.com/kevin-savaliya/AI-Powered-HRMS-Frontend)
- **Backend**: [GitHub Repo](https://github.com/kevin-savaliya/AI-Powered-HRMS-Backend)

## 👤 Author
**Kevin Savaliya**
* GitHub: [@kevin-savaliya](https://github.com/kevin-savaliya)
* LinkedIn: [@kevin-savaliya](https://www.linkedin.com/in/kevin-savaliya-787794241/)

---
> ⭐️ **If you found this project helpful, please star the repository!**
