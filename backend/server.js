const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const setupWebSocket = require('./websocket');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Setup WebSocket
const wsNotifications = setupWebSocket(server);
app.set('wsNotifications', wsNotifications);

// Security middleware
app.use(helmet());

// Rate limiting - Disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: { success: false, message: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://grievance-management-system-sage.vercel.app',
  'https://grievance-management-system-ol57-qph4ox3p5-saikriz898s-projects.vercel.app',
  'https://grievance-management-system-ol57.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

// CSRF Protection - Disabled for development
// app.use((req, res, next) => {
//   if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
//     const origin = req.get('Origin');
//     const referer = req.get('Referer');
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'http://localhost:3001',
//       'https://grievance-management-system-sage.vercel.app',
//       process.env.FRONTEND_URL
//     ].filter(Boolean);
//     
//     // Allow requests with valid origin or referer
//     if (origin && allowedOrigins.includes(origin)) {
//       return next();
//     }
//     if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) {
//       return next();
//     }
//     
//     // Allow API testing tools in development
//     if (process.env.NODE_ENV === 'development') {
//       return next();
//     }
//     
//     return res.status(403).json({ success: false, message: 'CSRF protection: Invalid origin' });
//   }
//   next();
// });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/grievances')) {
  fs.mkdirSync('uploads/grievances');
}

// Configure multer for file uploads (memory storage for Render)
const storage = process.env.NODE_ENV === 'production' 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.resolve(__dirname, 'uploads/grievances/');
        // Ensure path is within allowed directory
        if (!uploadPath.startsWith(path.resolve(__dirname, 'uploads/'))) {
          return cb(new Error('Invalid upload path'));
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(sanitizedName);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    });

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    file.originalname = sanitizedName;
    
    // Check for path traversal attempts
    if (sanitizedName.includes('..') || sanitizedName.includes('/') || sanitizedName.includes('\\')) {
      return cb(new Error('Invalid filename - path traversal detected'));
    }
    
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(sanitizedName).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname && sanitizedName.length > 0 && sanitizedName.length < 255) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type or filename'));
    }
  }
});

app.set('upload', upload);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'https://grievance-management-system-sage.vercel.app',
      'https://grievance-management-system-ol57-qph4ox3p5-saikriz898s-projects.vercel.app',
      'https://grievance-management-system-ol57.vercel.app',
      process.env.FRONTEND_URL
    ],
    credentials: true
  }
});

app.set('io', io);

// Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/features', require('./routes/features'));
app.use('/api/google-chat', require('./routes/googleChat'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test grievance endpoint
app.post('/api/test-grievance', (req, res) => {
  console.log('Test grievance request:', req.body);
  res.json({ 
    success: true, 
    message: 'Test endpoint working',
    body: req.body,
    headers: req.headers
  });
});

// Test delete endpoint
app.delete('/api/test-delete/:id', (req, res) => {
  console.log('Test delete request for ID:', req.params.id);
  res.json({ 
    success: true, 
    message: 'Delete endpoint working',
    id: req.params.id
  });
});

// Test Google Chat webhook
app.post('/api/test-chat', (req, res) => {
  console.log('Test Google Chat webhook:', JSON.stringify(req.body, null, 2));
  res.json({
    text: 'Hello! This is a test response from GrievAI Assistant. 🤖'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

const PORT = process.env.PORT || 5000;

// Kill any existing process on the port
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
    server.listen(PORT + 1, () => {
      console.log(`🚀 Server running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});