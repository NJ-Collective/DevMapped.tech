# Career Roadmap Application

A comprehensive full-stack application that generates personalized learning roadmaps for tech careers using AI-powered job matching and skills assessment.

## 🚀 Features

- **Personalized Roadmaps**: AI-generated learning paths based on user skills and career goals
- **Job Matching**: Intelligent job matching using Groq AI and user preferences
- **Skills Assessment**: Comprehensive skills evaluation and gap analysis
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Data**: Firebase integration for user data and roadmap storage

## 🏗️ Architecture

### Frontend (React + Vite + Tailwind)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router for navigation
- **State Management**: React hooks and context
- **API Integration**: Centralized API service layer

### Backend (Express.js + Node.js)
- **Framework**: Express.js with modern ES modules
- **AI Integration**: Groq AI for job matching and Anthropic Claude for roadmap generation
- **Database**: Firebase Firestore for data persistence
- **Security**: Rate limiting, CORS, and input validation
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
Cal-Hacks-12.0/
├── frontend/                 # React + Vite + Tailwind app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Reusable UI components
│   │   │   ├── forms/        # Form-specific components
│   │   │   └── roadmap/      # Roadmap-specific components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and Firebase services
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   ├── public/
│   └── package.json
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration
│   ├── package.json
│   └── server.js
├── shared/                 # Shared utilities and types
├── docs/                   # Documentation
├── .env.example           # Environment variables template
├── .gitignore
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Groq API key
- Anthropic API key

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Cal-Hacks-12.0

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Frontend Environment Variables
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend Environment Variables
PORT=8080
NODE_ENV=development

# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_client_email
```

### 3. Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Generate a service account key
4. Configure Firestore security rules
5. Set up the required collections:
   - `questions` - User questionnaire
   - `jobData` - Job listings
   - `users` - User data and responses

### 4. Run the Application

#### Development Mode

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend development server
cd frontend
npm run dev
```

#### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## 🔧 API Endpoints

### Health Check
- `GET /health` - Server health status

### User Management
- `GET /api/users/:username/submission-status` - Check user submission status
- `GET /api/users/:username/roadmap` - Get user roadmap
- `GET /api/users/:username/responses` - Get user responses

### Job Matching
- `POST /api/jobs/match` - Process job matching for user
- `GET /api/jobs/status/:username` - Get job matching status

### Roadmap Generation
- `POST /api/roadmap/generate` - Generate personalized roadmap
- `GET /api/roadmap/:username` - Get user roadmap

## 🎨 Frontend Components

### Common Components
- `Button` - Reusable button with variants
- `Input` - Form input with validation
- `LoadingSpinner` - Loading indicator
- `Header` - Application header
- `Sidebar` - Navigation sidebar

### Form Components
- `FormScreen` - Questionnaire interface
- `SuccessScreen` - Submission confirmation

### Roadmap Components
- `MainContent` - Roadmap display
- `WeekCard` - Weekly task display
- `TaskItem` - Individual task item
- `ProjectCard` - Project information

## 🔒 Security Features

- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error responses without sensitive data exposure
- **Environment Variables**: Sensitive data stored in environment variables

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
# Deploy with your preferred platform
```

## 📊 Performance Optimizations

- **Caching**: Redis caching for job data and user responses
- **Batch Processing**: Efficient AI processing
- **Code Splitting**: Lazy loading for better performance
- **Image Optimization**: Optimized assets and images

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added AI-powered job matching
- **v1.2.0** - Enhanced roadmap generation
- **v1.3.0** - Improved UI/UX and performance
