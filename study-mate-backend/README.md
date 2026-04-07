# Study Mate — Backend API

Node.js + Express + MongoDB backend for the Study Mate application.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Edit `.env` and fill in your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/studymate
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here     # Get from https://console.groq.com
CLIENT_URL=http://localhost:5173
```

### 3. Run the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login and get token |
| GET | `/me` | Private | Get current user |

**Register body:**
```json
{ "name": "John Doe", "email": "john@college.edu", "password": "123456", "college": "MIT" }
```

**Login body:**
```json
{ "email": "john@college.edu", "password": "123456" }
```

---

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | Private | Get profile + notes + stats |
| PUT | `/profile` | Private | Update name, bio, college |

---

### Notes — `/api/notes`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all notes (search, filter, paginate) |
| GET | `/stats` | Public | Get platform stats |
| GET | `/:id` | Public | Get single note |
| POST | `/` | Private | Upload a note (multipart/form-data) |
| GET | `/:id/download` | Private | Download file (increments count) |
| DELETE | `/:id` | Private | Delete own note |

**GET /api/notes query params:**
- `search` — search in title, description, subject
- `subject` — filter by subject name
- `page` — page number (default: 1)
- `limit` — results per page (default: 20)

**POST /api/notes form fields:**
- `file` — the file (PDF/DOC/DOCX/PPT/PPTX, max 10MB)
- `title` — note title (required)
- `subject` — subject name (required)
- `description` — optional description

---

### Chat — `/api/chat`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get all user chats |
| POST | `/` | Private | Create new chat |
| GET | `/:id` | Private | Get chat with messages |
| DELETE | `/:id` | Private | Delete a chat |
| POST | `/:id/upload-pdf` | Private | Upload PDF to chat (multipart/form-data, field: `pdf`) |
| POST | `/:id/message` | Private | Send message, get Groq AI response |
| DELETE | `/:id/pdf` | Private | Remove PDF from chat |

**POST /api/chat/:id/message body:**
```json
{ "content": "Explain the main topic of this document" }
```

---

## Authentication

All private routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Project Structure

```
study-mate-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, login, getMe
│   ├── userController.js      # Profile get/update
│   ├── noteController.js      # Notes CRUD + download
│   └── chatController.js      # Groq AI chat + PDF Q&A
├── middleware/
│   ├── authMiddleware.js      # JWT protect middleware
│   └── uploadMiddleware.js    # Multer file upload config
├── models/
│   ├── User.js                # User schema
│   ├── Note.js                # Note schema
│   └── Chat.js                # Chat + messages schema
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── noteRoutes.js
│   └── chatRoutes.js
├── uploads/
│   ├── notes/                 # Uploaded note files
│   └── pdfs/                  # Temporary chat PDFs
├── .env
├── .gitignore
├── package.json
└── server.js
```
