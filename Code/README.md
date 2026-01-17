# 🩺 AI Medical Voice Agent

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [AI Doctor Specialists](#ai-doctor-specialists)
- [Voice Integration](#voice-integration)
- [Security & Authentication](#security--authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**AI Medical Voice Agent** is a revolutionary healthcare application that leverages artificial intelligence and voice technology to provide instant, accurate medical assistance through natural voice conversations. The platform automates appointment scheduling, symptom triage, and follow-up care, delivering 24/7 medical support.

### 🚀 Key Highlights
- **Real-time Voice Conversations** with AI medical specialists
- **Multi-specialty AI Doctors** covering various medical domains
- **Automated Medical Reports** generation after consultations
- **Secure Session Management** with user authentication
- **Responsive Web Interface** with modern UI/UX design
- **Voice-to-Text & Text-to-Voice** integration using Vapi AI

## ✨ Features

### 🎤 Voice-Based Medical Consultations
- **Natural Language Processing**: Engage in conversational medical consultations
- **Real-time Transcription**: Live speech-to-text conversion during calls
- **Voice Synthesis**: AI doctors respond with natural-sounding voices
- **Call Duration Tracking**: Monitor consultation length and session management

### 👨‍⚕️ AI Medical Specialists
- **10+ Medical Specialties**: From General Physician to Dentist
- **Specialized Knowledge**: Each AI doctor has domain-specific expertise
- **Personalized Prompts**: Customized medical guidance for each specialty
- **Professional Voice Profiles**: Distinct voice characteristics for each specialist

### 📊 Medical Report Generation
- **Automated Analysis**: AI-generated comprehensive medical reports
- **Structured Data**: Organized symptom tracking and recommendations
- **Session History**: Complete consultation records and follow-up notes
- **Export Capabilities**: Downloadable medical consultation summaries

### 🔐 Security & Privacy
- **User Authentication**: Secure login via Clerk authentication
- **Session Isolation**: Private consultation sessions per user
- **Data Encryption**: Secure storage of medical conversations
- **HIPAA Compliance**: Privacy-focused medical data handling

### 📱 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Customizable theme preferences
- **Intuitive Navigation**: User-friendly dashboard and controls
- **Real-time Updates**: Live status indicators and call controls

## 🛠 Technology Stack

### Frontend
- **Next.js 15.3.4**: React framework with App Router
- **React 19.0.0**: Latest React with concurrent features
- **TypeScript 5.8.3**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Motion**: Smooth animations and transitions
- **Lucide React**: Modern icon library

### Backend & APIs
- **Next.js API Routes**: Server-side API endpoints
- **OpenAI GPT-4**: Advanced language model for medical conversations
- **Vapi AI**: Voice conversation platform integration
- **Assembly AI**: Real-time speech transcription
- **PlayHT**: High-quality voice synthesis

### Database & ORM
- **Neon Database**: Serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Database migrations and schema management

### Authentication & Security
- **Clerk**: User authentication and management
- **bcrypt**: Password hashing and security
- **JWT**: Secure session management

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **Nodemon**: Development server with auto-reload
- **Drizzle Kit**: Database schema management

## 🏗 Architecture

### Project Structure
```
my-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   ├── (routes)/                # Protected application routes
│   │   └── dashboard/          # User dashboard
│   │       └── medical-agent/  # Voice consultation interface
│   ├── api/                    # API endpoints
│   │   └── users/             # User-related APIs
│   └── _components/           # Shared components
├── components/                 # Reusable UI components
├── config/                    # Configuration files
│   ├── db.tsx               # Database configuration
│   ├── schema.tsx           # Database schema
│   └── OpenAiModel.tsx      # OpenAI configuration
├── context/                  # React context providers
├── lib/                      # Utility functions
├── shared/                   # Shared data and constants
└── public/                   # Static assets
```

### Data Flow
1. **User Authentication**: Clerk handles user login/signup
2. **Session Creation**: User selects AI doctor and creates consultation session
3. **Voice Integration**: Vapi AI manages real-time voice conversations
4. **AI Processing**: OpenAI GPT-4 processes medical conversations
5. **Report Generation**: Automated medical report creation
6. **Data Storage**: Session data stored in Neon PostgreSQL database

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- PostgreSQL database (Neon recommended)
- OpenAI API key
- Vapi AI API key
- Clerk authentication setup

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables (see Environment Variables section)

4. **Database Setup**
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Apply migrations to database
   npm run db:migrate
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# Vapi AI Configuration
NEXT_PUBLIC_VAPI_API_KEY="your-vapi-api-key"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# Application Configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);
```

### Session Chat Table
```sql
CREATE TABLE sessionChatTable (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR UNIQUE NOT NULL,
  notes TEXT,
  selected_doctor JSON NOT NULL,
  agent_prompt TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  conversation JSON,
  report JSON,
  created_by VARCHAR REFERENCES users(email),
  created_on VARCHAR NOT NULL
);
```

## 🔌 API Endpoints

### Session Management
- `POST /api/users/session-chat` - Create new consultation session
- `GET /api/users/session-chat?sessionID={id}` - Retrieve session details
- `GET /api/users/session-chat` - Get all user sessions

### Medical Reports
- `POST /api/users/medical-report` - Generate medical consultation report

### User Management
- `POST /api/users` - Create user account
- `GET /api/users` - Get user information

## 📖 Usage Guide

### 1. User Registration & Login
- Visit the application homepage
- Click "Get Started" or "Login" button
- Complete authentication via Clerk
- Access your personalized dashboard

### 2. Starting a Medical Consultation
1. **Select AI Doctor**: Choose from available medical specialists
2. **Add Notes**: Optionally add initial symptoms or concerns
3. **Start Session**: Click "Start Consultation" to create session
4. **Voice Call**: Click "Start Call" to begin voice conversation
5. **Real-time Conversation**: Speak naturally with AI medical specialist
6. **End Session**: Click "Disconnect" to end consultation

### 3. Reviewing Medical Reports
- **Automatic Generation**: Reports created after session completion
- **Structured Data**: Symptoms, recommendations, and severity levels
- **Session History**: Access all previous consultations
- **Download Options**: Export medical reports for records

### 4. Dashboard Features
- **Session History**: View all past consultations
- **AI Doctor Selection**: Browse available medical specialists
- **Quick Actions**: Start new consultations or review reports
- **User Profile**: Manage account settings and preferences

## 👨‍⚕️ AI Doctor Specialists

### Available Medical Specialists

| Specialist | Description | Voice ID | Subscription |
|------------|-------------|----------|--------------|
| **General Physician** | Everyday health concerns and common symptoms | will | Free |
| **Pediatrician** | Children's health from babies to teens | susan | Premium |
| **Dermatologist** | Skin issues, rashes, acne, infections | chris | Premium |
| **Psychologist** | Mental health and emotional well-being | ayla | Premium |
| **Nutritionist** | Healthy eating and weight management | charlotte | Premium |
| **Cardiologist** | Heart health and blood pressure issues | eileen | Premium |
| **ENT Specialist** | Ear, nose, and throat problems | hudson | Premium |
| **Orthopedic** | Bone, joint, and muscle pain | atlas | Premium |
| **Gynecologist** | Women's reproductive and hormonal health | aaliyah | Premium |
| **Dentist** | Oral hygiene and dental problems | will | Premium |

### Specialist Capabilities
- **Domain Expertise**: Specialized medical knowledge for each field
- **Custom Prompts**: Tailored conversation starters and guidance
- **Voice Personalities**: Distinct voice characteristics for each specialist
- **Medical Protocols**: Appropriate medical advice and recommendations

## 🎤 Voice Integration

### Vapi AI Integration
- **Real-time Voice Processing**: Instant speech recognition and synthesis
- **Natural Conversations**: Human-like voice interactions
- **Multi-language Support**: English language optimization
- **Voice Quality**: High-fidelity voice synthesis via PlayHT

### Voice Features
- **Speech Recognition**: Accurate transcription of user speech
- **Voice Synthesis**: Natural-sounding AI doctor responses
- **Call Controls**: Start, stop, and manage voice sessions
- **Audio Quality**: Crystal clear voice communication

### Technical Implementation
```typescript
// Voice session configuration
const vapiConfig = {
  transcriber: {
    provider: "assembly-ai",
    language: "en"
  },
  voice: {
    provider: "playht",
    voiceId: selectedDoctor.voiceId
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: doctorAgentPrompt
      }
    ]
  }
};
```

## 🔐 Security & Authentication

### User Authentication
- **Clerk Integration**: Secure user registration and login
- **Session Management**: Protected routes and user sessions
- **Role-based Access**: User-specific data isolation
- **Secure API Endpoints**: Authentication required for all medical APIs

### Data Security
- **Encrypted Storage**: All medical data encrypted at rest
- **Secure Transmission**: HTTPS for all data communication
- **Privacy Compliance**: HIPAA-compliant data handling
- **Session Isolation**: Private consultation sessions per user

### API Security
- **Authentication Middleware**: All API routes protected
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without data leakage
- **Rate Limiting**: Protection against abuse

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   ```

2. **Database Migration**
   ```bash
   npm run db:migrate
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Deploy to Platform**
   - **Vercel**: Recommended for Next.js applications
   - **Netlify**: Alternative deployment option
   - **AWS/GCP**: Self-hosted deployment options

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain configuration complete
- [ ] Monitoring and logging setup
- [ ] Performance optimization applied

## 🤝 Contributing

We welcome contributions to improve the AI Medical Voice Agent platform!

### Development Guidelines
1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**: Submit detailed description of changes

### Code Standards
- **TypeScript**: Strict type checking required
- **ESLint**: Follow established code style
- **Testing**: Include tests for new features
- **Documentation**: Update README for new features

### Areas for Contribution
- **New AI Specialists**: Add more medical specialties
- **Voice Improvements**: Enhance voice quality and naturalness
- **UI/UX Enhancements**: Improve user interface and experience
- **Security Features**: Strengthen privacy and security measures
- **Performance Optimization**: Improve application speed and efficiency

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions on GitHub
- **Email**: Contact the development team

---

**Built with ❤️ for revolutionizing healthcare through AI technology**

*This application is designed for educational and demonstration purposes. For actual medical use, please ensure compliance with local healthcare regulations and obtain necessary certifications.*
