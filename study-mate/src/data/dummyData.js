// Dummy data for Study Mate application

export const subjects = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Business',
  'Economics',
  'Literature',
  'History'
]

export const users = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'alex.johnson@college.edu',
    college: 'MIT',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Computer Science major, passionate about AI and machine learning.',
    joinedDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    email: 'sarah.chen@college.edu',
    college: 'Stanford',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Mathematics enthusiast, love solving complex problems.',
    joinedDate: '2024-02-20'
  },
  {
    id: 3,
    name: 'Mike Williams',
    email: 'mike.williams@college.edu',
    college: 'Harvard',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    bio: 'Physics graduate student, research assistant.',
    joinedDate: '2024-01-10'
  }
]

export const notes = [
  {
    id: 1,
    title: 'Introduction to Machine Learning',
    subject: 'Computer Science',
    description: 'Comprehensive notes covering ML fundamentals, supervised and unsupervised learning, neural networks, and practical applications.',
    fileType: 'PDF',
    fileSize: '2.5 MB',
    uploadedBy: users[0],
    uploadedAt: '2024-12-15',
    downloads: 245,
    college: 'MIT'
  },
  {
    id: 2,
    title: 'Calculus II - Integration Techniques',
    subject: 'Mathematics',
    description: 'Detailed notes on integration methods including substitution, integration by parts, partial fractions, and trigonometric integrals.',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    uploadedBy: users[1],
    uploadedAt: '2024-12-14',
    downloads: 189,
    college: 'Stanford'
  },
  {
    id: 3,
    title: 'Quantum Mechanics Basics',
    subject: 'Physics',
    description: 'Introduction to quantum mechanics covering wave-particle duality, Schrödinger equation, and quantum states.',
    fileType: 'PPT',
    fileSize: '5.2 MB',
    uploadedBy: users[2],
    uploadedAt: '2024-12-13',
    downloads: 312,
    college: 'Harvard'
  },
  {
    id: 4,
    title: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    description: 'Complete guide to arrays, linked lists, trees, graphs, sorting algorithms, and time complexity analysis.',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    uploadedBy: users[0],
    uploadedAt: '2024-12-12',
    downloads: 456,
    college: 'MIT'
  },
  {
    id: 5,
    title: 'Organic Chemistry Reactions',
    subject: 'Chemistry',
    description: 'Summary of important organic reactions, mechanisms, and synthesis strategies for exam preparation.',
    fileType: 'DOC',
    fileSize: '1.2 MB',
    uploadedBy: users[1],
    uploadedAt: '2024-12-11',
    downloads: 178,
    college: 'Stanford'
  },
  {
    id: 6,
    title: 'Linear Algebra Fundamentals',
    subject: 'Mathematics',
    description: 'Vector spaces, matrices, determinants, eigenvalues, and linear transformations explained with examples.',
    fileType: 'PDF',
    fileSize: '2.0 MB',
    uploadedBy: users[2],
    uploadedAt: '2024-12-10',
    downloads: 234,
    college: 'Harvard'
  },
  {
    id: 7,
    title: 'Web Development with React',
    subject: 'Computer Science',
    description: 'Modern React.js tutorials covering hooks, state management, routing, and building full-stack applications.',
    fileType: 'PDF',
    fileSize: '4.5 MB',
    uploadedBy: users[0],
    uploadedAt: '2024-12-09',
    downloads: 567,
    college: 'MIT'
  },
  {
    id: 8,
    title: 'Microeconomics Principles',
    subject: 'Economics',
    description: 'Supply and demand, consumer theory, production theory, and market structures explained.',
    fileType: 'PPT',
    fileSize: '2.8 MB',
    uploadedBy: users[1],
    uploadedAt: '2024-12-08',
    downloads: 145,
    college: 'Stanford'
  }
]

export const chatHistory = [
  {
    id: 1,
    title: 'Machine Learning Basics',
    messages: [
      { id: 1, role: 'user', content: 'What is supervised learning?' },
      { id: 2, role: 'assistant', content: 'Supervised learning is a type of machine learning where the model learns from labeled training data. The algorithm learns to map input features to the correct output by seeing many examples. Common applications include classification (predicting categories) and regression (predicting continuous values). Some popular supervised learning algorithms include linear regression, decision trees, random forests, and neural networks.' }
    ],
    createdAt: '2024-12-14'
  },
  {
    id: 2,
    title: 'Calculus Help',
    messages: [
      { id: 1, role: 'user', content: 'How do I integrate e^x * sin(x)?' },
      { id: 2, role: 'assistant', content: 'This requires integration by parts twice. Let me show you the solution:\n\n∫ e^x sin(x) dx\n\nFirst integration by parts:\n= e^x sin(x) - ∫ e^x cos(x) dx\n\nSecond integration by parts:\n= e^x sin(x) - [e^x cos(x) + ∫ e^x sin(x) dx]\n\nLet I = ∫ e^x sin(x) dx\n\nI = e^x sin(x) - e^x cos(x) - I\n2I = e^x(sin(x) - cos(x))\nI = (1/2)e^x(sin(x) - cos(x)) + C' }
    ],
    createdAt: '2024-12-13'
  }
]

export const currentUser = users[0]

export const stats = {
  totalNotes: 1247,
  subjects: subjects.length,
  activeUsers: 523,
  totalDownloads: 8432
}
