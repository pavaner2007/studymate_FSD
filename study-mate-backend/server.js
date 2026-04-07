require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const noteRoutes = require('./routes/noteRoutes')
const chatRoutes = require('./routes/chatRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Build allowed origins list from all possible env variable names
const rawOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((o) => o.split(','))
  .map((o) => o.trim())
  .filter(Boolean)

// Always allow localhost in development
if (NODE_ENV !== 'production') {
  rawOrigins.push('http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173')
}

console.log('Allowed CORS origins:', rawOrigins)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true)

      // Allow any vercel.app subdomain automatically
      if (origin.endsWith('.vercel.app')) return callback(null, true)

      // Allow any render.com subdomain automatically
      if (origin.endsWith('.onrender.com')) return callback(null, true)

      // Check explicit list
      if (rawOrigins.includes(origin)) return callback(null, true)

      console.warn(`CORS blocked: ${origin}`)
      return callback(null, false)
    },
    credentials: true,
  })
)

// Handle preflight for all routes
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    message: 'Study Mate API is running',
  })
})

app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`)
    })
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`)
    process.exit(1)
  }
}

startServer()

module.exports = app
