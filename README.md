# LeFri Platform

A comprehensive legal platform that combines legal consultations, process management, and emergency alerts. Our mission is to democratize access to immediate and free legal advice, making legal assistance accessible to everyone.

## 👨‍💻 Author
- **Jonnatan Peña**
- Location: Ecuador

## 🎯 Purpose

LeFri Platform was created with the vision of democratizing access to legal advice by providing:
- Immediate legal consultations
- Free initial legal guidance
- Emergency legal assistance
- Process management tools
- Access to legal resources

Our goal is to break down barriers to legal assistance and ensure that everyone has access to quality legal support when they need it most.

## 🚀 Technologies

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **Integrated APIs**: 
  - Google Gemini AI
  - WhatsApp Business API
  - Email Services
  - Voice Services
- **Deployment**:
  - Google Cloud Run
  - Google Cloud Build
  - Docker

## 📦 Project Structure

```
LeFriPlatform/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Main pages
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
├── server/                # Express Backend
│   ├── config/           # Configurations
│   ├── services/         # External services
│   ├── storage/          # Persistence layer
│   └── types/            # TypeScript types
├── scripts/              # Deployment and setup scripts
│   ├── deploy.sh         # Production deployment script
│   ├── setup-env.sh      # Environment setup script
│   ├── local-env.sh      # Local environment script
│   └── setup-local-env.sh # Local environment setup
└── shared/               # Shared code
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/dark-yx/LeFriPlatform.git
cd LeFriPlatform
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

### Local Development

1. Set up local environment:
```bash
# Export environment variables
export MONGODB_URI="your_mongodb_uri"
export GOOGLE_OAUTH_CLIENT_ID="your_google_client_id"
export GOOGLE_OAUTH_CLIENT_SECRET="your_google_client_secret"
export GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
export GEMINI_API_KEY="your_gemini_api_key"

# Or use the setup script
./scripts/setup-local-env.sh
```

2. Start development server:
```bash
npm run dev
```

### Production Deployment

1. Configure production environment:
```bash
./scripts/setup-env.sh
```

2. Deploy to Google Cloud Run:
```bash
./scripts/deploy.sh
```

## 🔧 Environment Variables

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `GOOGLE_OAUTH_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_OAUTH_REDIRECT_URI`: OAuth redirect URI
- `GEMINI_API_KEY`: Google Gemini AI API key

### CI/CD Variables (GitLab)
- `MONGODB_URI_BASE64`: Base64 encoded MongoDB URI
- `GOOGLE_OAUTH_CLIENT_ID_BASE64`: Base64 encoded Google OAuth client ID
- `GOOGLE_OAUTH_CLIENT_SECRET_BASE64`: Base64 encoded Google OAuth client secret
- `GEMINI_API_KEY_BASE64`: Base64 encoded Gemini API key
- `GOOGLE_OAUTH_REDIRECT_URI`: OAuth redirect URI

## 🚀 Deployment

### Local Development
1. Configure local environment using `setup-local-env.sh`
2. Start development server with `npm run dev`
3. Access application at `http://localhost:5000`

### Production Deployment
1. Configure production environment using `setup-env.sh`
2. Deploy to Google Cloud Run using `deploy.sh`
3. Access application at the provided Cloud Run URL

## 🔑 Authentication

The application uses Google OAuth 2.0 for authentication. To ensure proper functionality:

1. Make sure environment variables are correctly configured
2. Verify redirect URI is set up in Google Cloud Console
3. The client ID must be correctly configured in the environment variables

## 🚨 Troubleshooting

### Google Authentication Error

If you encounter the "Invalid server response" error:

1. Check the browser console logs (F12)
2. Ensure the server is running on port 5000
3. Verify environment variables are correctly configured
4. Clear browser cache and localStorage data
5. Restart the server

### Common Issues

1. **MongoDB Connection Error**:
   - Verify MongoDB URI
   - Ensure database is accessible

2. **Authentication Error**:
   - Verify Google OAuth credentials
   - Ensure redirect URI is correctly configured

3. **API Integration Issues**:
   - Verify all API keys are correctly set
   - Check API service status and quotas
   - Ensure proper API permissions are granted

4. **Deployment Issues**:
   - Check Cloud Run logs for errors
   - Verify environment variables in Cloud Run
   - Ensure proper IAM permissions

## 📝 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check`: TypeScript type checking
- `./scripts/setup-env.sh`: Configure production environment
- `./scripts/deploy.sh`: Deploy to Google Cloud Run
- `./scripts/setup-local-env.sh`: Configure local environment

## 🔒 Security

- Google OAuth 2.0 Authentication
- Secure sessions with express-session
- CSRF protection
- Data validation with Zod
- Input sanitization
- API key protection
- Environment variable security
- Base64 encoding for sensitive data
- Secure deployment with Google Cloud Run

## 📄 License

All rights reserved.

This software and its documentation are the intellectual property of LeFriPlatform. The following are strictly prohibited:

- Reproduction of all or part of the code
- Distribution or commercialization of the software
- Modification or creation of derivative works
- Unauthorized use of any part of the intellectual property

Any unauthorized use of this software constitutes copyright infringement and may result in legal action.

## 🙏 Sponsored by

- Underlife Foundation
- Weblifetech

---

Developed with ❤️ in Ecuador by Jonnatan Peña
