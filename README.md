# 🏥 Medicare Nepal - AI-Powered Healthcare Platform

A comprehensive, full-stack healthcare platform built with React, TypeScript, Node.js, and AI integration for symptom analysis, medicine scanning, and hospital discovery in Nepal.

## ✨ Features

### 🤖 AI-Powered Health Analysis
- **Symptom Analyzer**: AI-driven symptom evaluation with personalized recommendations
- **Medicine Scanner**: Image-based medicine identification and detailed information
- **Voice Input**: Multi-language voice recognition for symptoms and queries
- **Real-time Analysis**: Live updates during processing with Socket.IO

### 🏥 Healthcare Services
- **Hospital Finder**: Comprehensive directory of hospitals across Nepal
- **Emergency Contacts**: Quick access to emergency services and hotlines
- **Health Analytics**: Personal health tracking and trend analysis
- **Multi-language Support**: English, Nepali, and Hindi

### 🔒 Security & Privacy
- **JWT Authentication**: Secure user authentication and authorization
- **Data Encryption**: End-to-end encryption for sensitive health data
- **Rate Limiting**: API protection against abuse and spam
- **GDPR Compliance**: Privacy-first approach with user data control

### 🎨 Modern UI/UX
- **3D Design**: Stunning 3D effects and animations
- **Fire Cursor**: Interactive cursor with flame trail effects
- **Glass Morphism**: Modern glassmorphism design elements
- **Responsive**: Mobile-first responsive design
- **Dark Theme**: Eye-friendly dark theme with neon accents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Google Cloud Vision API key
- Gemini AI API key
- Cloudinary account (for image storage)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/your-username/medicare-nepal.git
cd medicare-nepal
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Environment Setup**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:
\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/medicare-nepal

# API Keys
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLOUD_VISION_KEY=your-vision-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
\`\`\`

4. **Start the application**
\`\`\`bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately
npm run client  # Frontend only
npm run server  # Backend only
\`\`\`

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

\`\`\`
medicare-nepal/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── services/          # API client and services
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js application
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   ├── utils/             # Backend utilities
│   ├── socket/            # Socket.IO handlers
│   └── jobs/              # Cron jobs
├── public/                # Static assets
└── docs/                  # Documentation
\`\`\`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Symptom Analysis
- `POST /api/symptoms/analyze` - Analyze symptoms
- `GET /api/symptoms/history` - Get analysis history
- `POST /api/symptoms/feedback/:id` - Submit feedback

### Medicine Analysis
- `POST /api/medicines/analyze-image` - Analyze medicine image
- `POST /api/medicines/analyze-text` - Analyze by medicine name
- `GET /api/medicines/search` - Search medicines

### Hospitals
- `GET /api/hospitals` - Get hospitals with filters
- `GET /api/hospitals/provinces` - Get provinces
- `GET /api/hospitals/emergency/numbers` - Emergency contacts

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/health-trends` - Health trends data
- `GET /api/analytics/real-time` - Real-time metrics

## 🤖 AI Integration

### Gemini AI
- Symptom analysis and health recommendations
- Medicine information and alternatives
- Natural language processing for health queries

### Google Cloud Vision
- Medicine image recognition and text extraction
- Medical document analysis
- Prescription reading capabilities

### Voice Recognition
- Multi-language speech-to-text
- Symptom input via voice commands
- Accessibility features for users with disabilities

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive input sanitization
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware
- **Encryption**: Bcrypt password hashing

## 🌍 Deployment

### Production Build
\`\`\`bash
npm run build
\`\`\`

### Docker Deployment
\`\`\`bash
# Build and run with Docker
docker-compose up -d
\`\`\`

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
CLIENT_URL=https://your-domain.com
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
\`\`\`

## 📊 Monitoring & Analytics

- **Health Metrics**: Real-time system health monitoring
- **User Analytics**: Usage patterns and engagement tracking
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance**: API response time and throughput monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@medicare-nepal.com
- **Phone**: +977 9763774451
- **Documentation**: [docs.medicare-nepal.com](https://docs.medicare-nepal.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/medicare-nepal/issues)

## 🙏 Acknowledgments

- **Google AI**: For Gemini API and Cloud Vision services
- **MongoDB**: For database solutions
- **Vercel**: For deployment and hosting
- **Nepal Health Ministry**: For healthcare data and guidelines
- **Open Source Community**: For the amazing libraries and tools

---

**Made with ❤️ for the people of Nepal**

*Empowering healthcare through technology and AI*
\`\`\`

This completes the full-stack Medicare Nepal application with:

✅ **Fixed Frontend Issues**:
- Corrected `index.css` with proper Tailwind imports
- Fixed `tailwind.config.js` with proper 3D utilities
- Corrected `SymptomAnalyzer.tsx` with proper backend integration
- Added proper error handling and loading states

✅ **Complete Backend**:
- Full Express.js server with MongoDB integration
- All API routes with proper validation and security
- Real-time Socket.IO integration
- AI services (Gemini & Google Vision)
- Authentication and authorization
- File upload and image processing
- Analytics and health data tracking
- Cron jobs for data synchronization

✅ **Security Features**:
- JWT authentication
- Rate limiting
- Input validation
- CORS and Helmet security
- Spam detection
- Password hashing

✅ **3D UI/UX**:
- Fire cursor with trail effects
- 3D button animations
- Glass morphism design
- Neon text effects
- Responsive 3D transformations

✅ **Real-time Features**:
- Socket.IO for live updates
- Real-time analysis progress
- Live dashboard metrics
- Instant notifications

The application is now production-ready with proper error handling, security measures, and a stunning 3D interface that works seamlessly across all devices.
