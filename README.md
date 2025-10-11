# 🎓 Grievance Management System

A complete, modern grievance management system built with React and Node.js for educational institutions.

## ✨ Features

- 🔐 **ID-Based Authentication** - Login with unique ID numbers (Student/Faculty/Staff/Admin)
- 📝 **Grievance Management** - Submit, track, and manage grievances with file attachments
- 👥 **Role-Based Access Control** - Different dashboards for each user type
- 📊 **Admin Dashboard** - Complete grievance management and analytics
- 🔍 **Real-time Tracking** - Track grievances with unique tracking ID
- 🎨 **Modern UI** - Tailwind CSS with Framer Motion animations
- 📱 **SMS Notifications** - Optional Twilio integration
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📈 **Analytics & Reports** - Export functionality and advanced filtering

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd grievance-system-fresh
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grievance_system
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000

# Admin credentials
ADMIN_NAME=System Administrator
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=admin123
ADMIN_ID=ADMIN001
ADMIN_DEPT=IT Administration

# Optional: Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_APP_NAME=GrievAI
REACT_APP_VERSION=1.0.0
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with ID number and password
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/reset-password` - Reset password

### Grievances
- `POST /api/grievances` - Submit new grievance
- `GET /api/grievances/my` - Get user's grievances
- `GET /api/grievances/track/:trackingId` - Track grievance by ID
- `POST /api/grievances/:id/comments` - Add comment to grievance

### Admin
- `GET /api/grievances` - Get all grievances (admin only)
- `PUT /api/grievances/:id/status` - Update grievance status
- `GET /api/admin/analytics` - Get system analytics

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Axios for API calls
- React Router for navigation
- React Hot Toast for notifications

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time updates
- Multer for file uploads
- Helmet for security
- Express Rate Limit
- Twilio for SMS (optional)

## 📊 Project Structure

```
grievance-system-fresh/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── grievanceController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Grievance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── grievances.js
│   │   └── admin.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── utils/
│   │   └── smsService.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── api/
│   └── index.js (Vercel serverless)
└── vercel.json
```

## 🎯 User Roles & Access

### Student
- Login with Student ID
- Submit grievances
- Track grievance status
- Add comments
- View personal dashboard

### Faculty
- Login with Faculty ID
- Submit grievances
- Review assigned grievances
- Provide feedback

### Staff
- Login with Staff ID
- Handle administrative grievances
- Process requests
- Update statuses

### Admin
- Login with Admin ID
- Full system access
- User management
- Analytics and reports
- System configuration

## 🔐 Default Admin Access

**Credentials:**
- ID: `ADMIN001`
- Password: `admin123`

## 🚀 Deployment

### Vercel (Recommended)

1. **Setup MongoDB Atlas**
2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```
3. **Set Environment Variables in Vercel Dashboard**
4. **Update Frontend URLs**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📱 Features Overview

- **Multi-role Authentication System**
- **Comprehensive Grievance Management**
- **Real-time Notifications**
- **File Upload Support**
- **Advanced Search & Filtering**
- **Export Functionality**
- **Mobile Responsive Design**
- **Dark Mode Support**
- **SMS Integration (Optional)**
- **Analytics Dashboard**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for educational institutions
- Designed with modern web technologies
- Focus on user experience and security

---

**Built with ❤️ for better grievance management in educational institutions**