# Technical Documentation: LeFri Platform

## 1. System Overview

LeFri Platform is a comprehensive legal assistance platform that leverages artificial intelligence and multi-agent systems to provide legal services and support. The platform is built using a modern tech stack with a focus on scalability, security, and user experience.

## 2. Technology Stack

### 2.1 Core Technologies
- **Backend**: Node.js with Express.js
- **Frontend**: React with TypeScript
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **AI Integration**: 
  - Google Gemini AI
  - LangChain
- **Real-time Communication**: WebSocket
- **File Storage**: Multer for file uploads
- **UI Framework**: 
  - Tailwind CSS
  - Radix UI Components
  - Framer Motion for animations
- **Deployment**:
  - Google Cloud Run
  - Google Cloud Build
  - Docker

### 2.2 Key Dependencies
```json
{
  "AI & ML": {
    "@anthropic-ai/sdk": "^0.37.0",
    "@google/generative-ai": "^0.24.1",
    "langchain": "^0.3.27"
  },
  "UI Components": {
    "@radix-ui/*": "Multiple components",
    "framer-motion": "^11.13.1",
    "tailwindcss": "^3.4.17"
  },
  "Backend": {
    "express": "^4.21.2",
    "mongoose": "^8.15.1",
    "puppeteer": "^24.10.0"
  },
  "Deployment": {
    "docker": "latest",
    "google-cloud-build": "latest",
    "google-cloud-run": "latest"
  }
}
```

## 3. System Architecture

### 3.1 Multi-Agent System
The platform implements a sophisticated multi-agent system that includes:

1. **Legal Assistant Agent**
   - Handles legal consultations
   - Processes legal documents
   - Provides legal advice

2. **Document Processing Agent**
   - Manages document uploads
   - Extracts relevant information
   - Formats legal documents

3. **Communication Agent**
   - Handles WhatsApp integration
   - Manages email communications
   - Processes voice interactions

4. **Emergency Response Agent**
   - Manages emergency alerts
   - Coordinates emergency contacts
   - Handles urgent legal situations

### 3.2 Core Services

1. **Authentication Service**
   - Google OAuth integration
   - Session management
   - User authentication and authorization

2. **Storage Service**
   - File upload handling
   - Document storage
   - User data management

3. **AI Services**
   - Gemini AI integration
   - LangChain implementation
   - Natural language processing

4. **Communication Services**
   - WhatsApp integration
   - Email service
   - Voice service

5. **Deployment Services**
   - Google Cloud Run hosting
   - Google Cloud Build CI/CD
   - Docker containerization

## 4. Data Flow

### 4.1 User Authentication Flow
1. User initiates login/registration
2. System validates credentials
3. Session is created and stored
4. User data is retrieved/created
5. Authentication token is generated

### 4.2 Legal Consultation Flow
1. User submits legal query
2. Multi-agent system processes request
3. AI models analyze the query
4. Response is generated and formatted
5. Result is delivered to user

### 4.3 Document Processing Flow
1. User uploads document
2. Document is validated and stored
3. AI processes document content
4. Relevant information is extracted
5. Processed data is stored and returned

### 4.4 Deployment Flow
1. Code is pushed to repository
2. Cloud Build triggers build process
3. Docker image is created and pushed
4. Cloud Run deploys new version
5. Traffic is routed to new deployment

## 5. Security Implementation

### 5.1 Authentication Security
- Session-based authentication
- Secure cookie handling
- OAuth 2.0 implementation
- Password hashing (planned)

### 5.2 Data Security
- MongoDB connection security
- File upload restrictions
- API endpoint protection
- Rate limiting implementation
- Base64 encoding for sensitive data
- Environment variable protection

### 5.3 Deployment Security
- Secure container images
- IAM role-based access
- Network security policies
- SSL/TLS encryption
- Secure environment variables

## 6. API Endpoints

### 6.1 Authentication Endpoints
```typescript
POST /api/auth/google
POST /api/auth/login
POST /api/auth/register
GET /api/auth/google/callback
GET /api/auth/google/url
```

### 6.2 User Management Endpoints
```typescript
GET /api/users/me
PUT /api/users/me
GET /api/users/me/emergency-contacts
POST /api/users/me/emergency-contacts
```

### 6.3 Legal Services Endpoints
```typescript
POST /api/legal/consultations
GET /api/legal/consultations
POST /api/legal/processes
GET /api/legal/processes
```

## 7. Database Schema

### 7.1 User Schema
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  language: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7.2 Legal Process Schema
```typescript
interface LegalProcess {
  id: string;
  userId: string;
  type: string;
  status: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 8. AI Integration

### 8.1 Gemini AI Implementation
- Natural language processing
- Legal document analysis
- Query understanding and response generation

### 8.2 LangChain Integration
- Chain of thought processing
- Multi-step reasoning
- Context-aware responses

## 9. Deployment Configuration

### 9.1 Local Development
```bash
# Environment setup
./scripts/setup-local-env.sh

# Start development server
npm run dev
```

### 9.2 Production Deployment (Google Cloud Run)
```bash
# Environment setup
./scripts/setup-env.sh

# Deploy to Cloud Run
./scripts/deploy.sh
```

### 9.3 Production Deployment (VPS / PM2)
```bash
# Copy and edit environment variables
cp .env.example .env

# Run deployment script (installs dependencies, builds, and starts/reloads PM2)
./deploy.sh
```

### 9.3 CI/CD Configuration
```yaml
# GitLab CI/CD variables
MONGODB_URI_BASE64: <base64_encoded_mongodb_uri>
GOOGLE_OAUTH_CLIENT_ID_BASE64: <base64_encoded_client_id>
GOOGLE_OAUTH_CLIENT_SECRET_BASE64: <base64_encoded_client_secret>
GEMINI_API_KEY_BASE64: <base64_encoded_gemini_key>
GOOGLE_OAUTH_REDIRECT_URI: <oauth_redirect_uri>
```

### 9.4 Docker Configuration
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN mkdir -p dist/public/assets
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"]
```

## 10. Monitoring and Logging

### 10.1 Application Logs
- Console logging for development
- Cloud Run logs for production
- Error tracking and monitoring

### 10.2 Performance Monitoring
- Response time tracking
- Resource utilization
- Error rate monitoring

### 10.3 Security Monitoring
- Authentication attempts
- API usage patterns
- Security event logging
