# Study Mate - College Learning & AI Study Assistant Platform

Study Mate is a modern, responsive college learning platform that allows students to upload, browse, and download study notes within their verified college community. Additionally, it features an intelligent academic AI assistant powered by Groq's LLMs (such as `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, or custom models), capable of performing on-demand document Q&A, real-time web page scraping, and YouTube video summarization.

---

## 🏗️ System Architecture & Data Flow

Study Mate is structured as a decoupled full-stack application containing a **React SPA Frontend** and an **Express REST API Backend** backed by a **MongoDB** database.

```mermaid
graph TD
    subgraph Client ["React Frontend (Vite + Tailwind)"]
        A["Dashboard & UI Pages"]
        B["File Upload Component"]
        C["AI Chat Panel"]
    end

    subgraph Server ["Express Backend API"]
        D["JWT Auth Middleware"]
        E["Multer File Middleware"]
        F["Notes Controller"]
        G["Chat Controller"]
        H["ErrorHandler Middleware"]
    end

    subgraph Database ["Storage Layer"]
        I[("MongoDB / Mongoose")]
        J["Local Disk Storage /uploads"]
    end

    subgraph AI ["LLM & Extractors"]
        K["Groq SDK / Configurable LLM (e.g. gpt-oss-120b)"]
        L["pdf-parse"]
        M["Cheerio Web Scraper"]
        N["youtube-transcript & Supadata Utility"]
    end

    %% Interactions
    A -->|1. REST Request + Auth Header| D
    B -->|2. Multipart Form-Data| E
    C -->|3. Messages / PDF / URLs / YouTube| G
    
    D --> F
    D --> G
    E -->|Uploads PDF/DOC| J
    
    F -->|Notes CRUD| I
    G -->|Conversations & Contexts| I
    
    G -->|Reads PDF Text| L
    G -->|Scrapes URL| M
    G -->|Fetches Captions| N
    G -->|System + Context Prompt| K
```

---

## 🛠️ Complete Technology Stack

### Frontend Client
- **Framework & Tooling**: [React 18](https://react.dev/) (built with [Vite](https://vitejs.dev/))
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) & [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) (for markdown rendering)
- **Networking**: [Axios](https://github.com/axios/axios) (configured with base URLs and JWT interceptors)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Content Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown)

### Backend API Server
- **Runtime Environment**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **AI Core**: [Groq SDK](https://console.groq.com/) utilizing configurable models (default: `openai/gpt-oss-120b`)
- **File Parsing & Uploads**: [Multer](https://github.com/expressjs/multer) & [pdf-parse](https://github.com/info360/pdf-parse)
- **Web Scraping**: [Cheerio](https://cheerio.js.org/) & [Axios](https://github.com/axios/axios)
- **YouTube Transcripts**: [youtube-transcript](https://github.com/Kakulukian/youtube-transcript) + fallback via Supadata API
- **Security & Authorization**: [JSON Web Tokens (JWT)](https://jwt.io/) & [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
- **CORS Handling**: Dynamic origin lists supporting developer environments (localhost) and production deployments (`.vercel.app`, `.onrender.com`).

---

## 📁 Codebase Directory Structure

```
c:/FSD_Project/
├── study-mate/                  # React + Vite Frontend
│   ├── .env.example             # Frontend environment variables template
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API connection configurations and fetch calls
│   │   ├── components/          # Reusable UI elements (Buttons, Skeletons, Modals)
│   │   ├── context/             # React Contexts (AuthContext for user state)
│   │   ├── data/                # Mock/Fallback data constants
│   │   ├── layouts/             # MainLayout (Sidebar/BottomNav shell)
│   │   ├── pages/               # Page Components (Login, Dashboard, Notes, Upload, Chatbot, Profile)
│   │   ├── App.jsx              # Main routing hub and route guard configuration
│   │   ├── index.css            # Base Tailwind configurations and root styles
│   │   └── main.jsx             # React DOM renderer
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── study-mate-backend/          # Node.js + Express Backend
    ├── .env.example             # Backend environment variables template
    ├── config/
    │   └── db.js                # MongoDB connection routine
    ├── controllers/
    │   ├── authController.js    # Registration, token validation, account checking
    │   ├── userController.js    # Profile management, bookmark operations
    │   ├── noteController.js    # Notes uploading, searching, indexing, downloading
    │   └── chatController.js    # Groq API connections, PDF/Scraper/YouTube workflows
    ├── middleware/
    │   ├── authMiddleware.js    # JWT payload checks & security guards
    │   ├── errorMiddleware.js   # 404 & 500 formatted JSON error structures
    │   └── uploadMiddleware.js  # Multer setup (Disk destination & file type filters)
    ├── models/
    │   ├── User.js              # User profiles schema
    │   ├── Note.js              # Note details and file paths schema
    │   └── Chat.js              # Message logs and AI contexts schema
    ├── routes/
    │   ├── authRoutes.js        # Auth endpoint routing
    │   ├── userRoutes.js        # Profile endpoint routing
    │   ├── noteRoutes.js        # Notes catalog routing
    │   └── chatRoutes.js        # AI engine routing
    ├── uploads/                 # Storage for note attachments and PDFs
    ├── seed.js                  # Database seeder with sample users & notes
    ├── server.js                # Application bootstrapper
    └── package.json
```

---

## ⚡ Main Core Features

### 1. Unified Dashboard & Analytics
Provides quick metrics regarding notes shared, download counters, and active AI chats. Lists recent notes uploaded within the student's college to encourage peer engagement.

### 2. Searchable Notes Repository
- Supports full-text indexing inside MongoDB across note titles, descriptions, and subject fields.
- Limits file types strictly to academic documents (PDF, PPT, PPTX, DOC, DOCX up to 10MB).
- Facilitates quick subject filtering (e.g. Computer Science, Mathematics, Physics, Chemistry, Biology, Engineering, Business, Economics, Literature, History).

### 3. Context-Aware AI Chat Engine
The AI Chatbot allows students to create distinct threads, each of which can run in multiple modes:
- **Default Mode**: Acts as a general, conversational academic tutor.
- **Document Q&A (PDF)**: Extracts raw text out of an uploaded PDF on the fly. The conversation scope is restricted strictly to answering questions based on that document.
- **Web Scraping Mode**: Students enter a website URL. The backend scrapes the DOM via Cheerio, strips boilerplate tags, and saves the text content as context.
- **YouTube Q&A**: Uses automated video transcripts to summarize video lectures instantly and answer complex theoretical queries about the lecture.

---

## 🛰️ API Reference Guide

### Auth Endpoints (`/api/auth`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Registers a new student account |
| `POST` | `/login` | Public | Standard email/password verification, returns JWT token |
| `GET` | `/me` | JWT Protected | Verifies valid session and returns authenticated user info |

### User Profile Endpoints (`/api/users`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | JWT Protected | Retrieves user stats, uploaded files, and bookmarks |
| `PUT` | `/profile` | JWT Protected | Updates username, college name, bio, and details |

### Notes Repository Endpoints (`/api/notes`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Paginated fetch of notes with subject and text query support |
| `GET` | `/stats` | Public | Returns global upload and download statistics |
| `GET` | `/:id` | Public | Returns info for a specific note |
| `POST` | `/` | JWT Protected | Handles note uploading (expects multipart form-data) |
| `GET` | `/:id/download` | JWT Protected | Streams note attachment and increments download counter |
| `DELETE` | `/:id` | JWT Protected | Deletes notes uploaded by the current user |

### AI Engine Endpoints (`/api/chat`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | JWT Protected | Lists user's active chats |
| `POST` | `/` | JWT Protected | Creates a new chat thread |
| `GET` | `/:id` | JWT Protected | Retrieves messages and settings for a specific chat |
| `DELETE` | `/:id` | JWT Protected | Deletes an entire chat thread |
| `POST` | `/:id/upload-pdf` | JWT Protected | Uploads a PDF, extracts text, and appends context |
| `POST` | `/:id/scrape` | JWT Protected | Fetches an external webpage, parses main content |
| `POST` | `/:id/youtube` | JWT Protected | Downloads YouTube transcripts and compiles initial summaries |
| `POST` | `/:id/message` | JWT Protected | Submits user message, processes context, and returns Groq response |
| `DELETE` | `/:id/pdf` | JWT Protected | Clears PDF attachments and context |
| `DELETE` | `/:id/web` | JWT Protected | Clears scraped web contexts |
| `DELETE` | `/:id/youtube` | JWT Protected | Clears YouTube transcript contexts |

---

## 🚀 Setup & Execution Guide

### Prerequisite Checklist
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas
- **Groq API Key** (obtainable from [Groq Console](https://console.groq.com/))

---

### 1. Database & Server Setup

1. Navigate into the backend directory:
   ```bash
   cd study-mate-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the provided template:
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/studymate
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=openai/gpt-oss-120b
   CLIENT_URL=http://localhost:5173
   SUPADATA_API_KEY=your_optional_supadata_key_here
   ```

4. Seed the database with sample notes and users:
   ```bash
   node seed.js
   ```

5. Start the backend API server:
   ```bash
   # Development with auto-reload
   npm run dev

   # Production mode
   npm start
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Client Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd study-mate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `.env` from template:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client application will run at `http://localhost:5173`.

---

### 🔑 Default Test Credentials (from `seed.js`)
- **Email**: `alex.johnson@college.edu`
- **Password**: `123456`