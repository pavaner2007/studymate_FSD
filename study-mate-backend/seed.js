require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Note = require('./models/Note')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected')

    // Clear existing data
    await User.deleteMany({})
    await Note.deleteMany({})
    console.log('Cleared existing data')

    // Create users
    const hashedPassword = await bcrypt.hash('123456', 12)

    const users = await User.insertMany([
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@college.edu',
        password: hashedPassword,
        college: 'MIT',
        bio: 'Computer Science major, passionate about AI and machine learning.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@college.edu',
        password: hashedPassword,
        college: 'Stanford',
        bio: 'Mathematics enthusiast, love solving complex problems.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      {
        name: 'Mike Williams',
        email: 'mike.williams@college.edu',
        password: hashedPassword,
        college: 'Harvard',
        bio: 'Physics graduate student, research assistant.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      },
    ])
    console.log('Created 3 users')

    // Create notes
    await Note.insertMany([
      {
        title: 'Introduction to Machine Learning',
        subject: 'Computer Science',
        description: 'Comprehensive notes covering ML fundamentals, supervised and unsupervised learning, neural networks, and practical applications.',
        fileName: 'intro-to-ml.pdf',
        filePath: 'uploads/notes/intro-to-ml.pdf',
        fileType: 'PDF',
        fileSize: '2.5 MB',
        college: 'MIT',
        uploadedBy: users[0]._id,
        downloads: 245,
        createdAt: new Date('2024-12-15'),
      },
      {
        title: 'Calculus II - Integration Techniques',
        subject: 'Mathematics',
        description: 'Detailed notes on integration methods including substitution, integration by parts, partial fractions, and trigonometric integrals.',
        fileName: 'calculus-2.pdf',
        filePath: 'uploads/notes/calculus-2.pdf',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        college: 'Stanford',
        uploadedBy: users[1]._id,
        downloads: 189,
        createdAt: new Date('2024-12-14'),
      },
      {
        title: 'Quantum Mechanics Basics',
        subject: 'Physics',
        description: 'Introduction to quantum mechanics covering wave-particle duality, Schrödinger equation, and quantum states.',
        fileName: 'quantum-mechanics.pdf',
        filePath: 'uploads/notes/quantum-mechanics.pdf',
        fileType: 'PDF',
        fileSize: '5.2 MB',
        college: 'Harvard',
        uploadedBy: users[2]._id,
        downloads: 312,
        createdAt: new Date('2024-12-13'),
      },
      {
        title: 'Data Structures & Algorithms',
        subject: 'Computer Science',
        description: 'Complete guide to arrays, linked lists, trees, graphs, sorting algorithms, and time complexity analysis.',
        fileName: 'dsa-notes.pdf',
        filePath: 'uploads/notes/dsa-notes.pdf',
        fileType: 'PDF',
        fileSize: '3.1 MB',
        college: 'MIT',
        uploadedBy: users[0]._id,
        downloads: 456,
        createdAt: new Date('2024-12-12'),
      },
      {
        title: 'Organic Chemistry Reactions',
        subject: 'Chemistry',
        description: 'Summary of important organic reactions, mechanisms, and synthesis strategies for exam preparation.',
        fileName: 'organic-chemistry.pdf',
        filePath: 'uploads/notes/organic-chemistry.pdf',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        college: 'Stanford',
        uploadedBy: users[1]._id,
        downloads: 178,
        createdAt: new Date('2024-12-11'),
      },
      {
        title: 'Linear Algebra Fundamentals',
        subject: 'Mathematics',
        description: 'Vector spaces, matrices, determinants, eigenvalues, and linear transformations explained with examples.',
        fileName: 'linear-algebra.pdf',
        filePath: 'uploads/notes/linear-algebra.pdf',
        fileType: 'PDF',
        fileSize: '2.0 MB',
        college: 'Harvard',
        uploadedBy: users[2]._id,
        downloads: 234,
        createdAt: new Date('2024-12-10'),
      },
      {
        title: 'Web Development with React',
        subject: 'Computer Science',
        description: 'Modern React.js tutorials covering hooks, state management, routing, and building full-stack applications.',
        fileName: 'react-notes.pdf',
        filePath: 'uploads/notes/react-notes.pdf',
        fileType: 'PDF',
        fileSize: '4.5 MB',
        college: 'MIT',
        uploadedBy: users[0]._id,
        downloads: 567,
        createdAt: new Date('2024-12-09'),
      },
      {
        title: 'Microeconomics Principles',
        subject: 'Economics',
        description: 'Supply and demand, consumer theory, production theory, and market structures explained.',
        fileName: 'microeconomics.pdf',
        filePath: 'uploads/notes/microeconomics.pdf',
        fileType: 'PDF',
        fileSize: '2.8 MB',
        college: 'Stanford',
        uploadedBy: users[1]._id,
        downloads: 145,
        createdAt: new Date('2024-12-08'),
      },
      {
        title: 'Biology Cell Structure',
        subject: 'Biology',
        description: 'Detailed notes on cell organelles, cell division, DNA replication, and protein synthesis.',
        fileName: 'biology-cells.pdf',
        filePath: 'uploads/notes/biology-cells.pdf',
        fileType: 'PDF',
        fileSize: '3.3 MB',
        college: 'Harvard',
        uploadedBy: users[2]._id,
        downloads: 198,
        createdAt: new Date('2024-12-07'),
      },
      {
        title: 'Engineering Thermodynamics',
        subject: 'Engineering',
        description: 'Laws of thermodynamics, heat transfer, entropy, and thermodynamic cycles for engineering students.',
        fileName: 'thermodynamics.pdf',
        filePath: 'uploads/notes/thermodynamics.pdf',
        fileType: 'PDF',
        fileSize: '2.6 MB',
        college: 'MIT',
        uploadedBy: users[0]._id,
        downloads: 221,
        createdAt: new Date('2024-12-06'),
      },
      {
        title: 'Business Management Strategies',
        subject: 'Business',
        description: 'Strategic management, organizational behavior, leadership styles, and business planning frameworks.',
        fileName: 'business-management.pdf',
        filePath: 'uploads/notes/business-management.pdf',
        fileType: 'PDF',
        fileSize: '1.9 MB',
        college: 'Stanford',
        uploadedBy: users[1]._id,
        downloads: 134,
        createdAt: new Date('2024-12-05'),
      },
      {
        title: 'World History - Modern Era',
        subject: 'History',
        description: 'Comprehensive notes on modern world history from the Industrial Revolution to the 21st century.',
        fileName: 'world-history.pdf',
        filePath: 'uploads/notes/world-history.pdf',
        fileType: 'PDF',
        fileSize: '4.1 MB',
        college: 'Harvard',
        uploadedBy: users[2]._id,
        downloads: 167,
        createdAt: new Date('2024-12-04'),
      },
    ])

    console.log('Created 12 dummy notes')
    console.log('\n✅ Seed completed successfully!')
    console.log('\nTest login credentials:')
    console.log('  Email: alex.johnson@college.edu')
    console.log('  Password: 123456')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }
}

seed()
