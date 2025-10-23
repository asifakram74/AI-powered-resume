# Persona CV - AI-Powered Resume Builder

A modern, full-stack application for creating professional resumes with AI optimization, ATS analysis, and cover letter generation.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Redux Toolkit
- **Backend**: Node.js with Express.js for AI operations
- **Authentication**: Laravel API for user management
- **Database**: MySQL (via Laravel)
- **AI Services**: OpenAI integration for CV optimization and analysis

## 📋 Prerequisites

- Node.js 18+ and npm
- PHP 8.1+ and Composer (for Laravel API)
- MySQL database
- OpenAI API key

## 🚀 Frontend Setup & Build

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local` file:
   ```env
   # Laravel API URL for authentication on production
   NEXT_PUBLIC_API_URL=https://backendcv.onlinetoolpot.com
   
   # Laravel API URL for authentication on staging
   NEXT_PUBLIC_API_URL=https://stagingbackend.resumaic.com
   
   # Node.js API URL for AI operations on production
   NEXT_PUBLIC_NODEJS_API_URL=  http://localhost:3001

   # Node.js API URL for AI operations on staging
   NEXT_PUBLIC_NODEJS_API_URL=https://stagingnode.resumaic.com
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:3000`

### Production Build

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Export Static Files (Optional)**
   ```bash
   npm run export
   ```

## 🔧 Backend Setup & Build

### Development Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in backend directory:
   ```env
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key_here
   LARAVEL_API_URL=https://your-laravel-api.com/api
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```
   Backend runs on: `  http://localhost:3001`

### Production Build

1. **Build TypeScript**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## 🌐 cPanel Deployment Guide

### Prerequisites for cPanel

- cPanel hosting with Node.js support
- MySQL database access
- SSL certificate (recommended)
- Domain/subdomain configured

### Step 1: Prepare Files for Upload

1. **Frontend Build**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Backend Build**
   ```bash
   cd backend
   npm run build
   ```

### Step 2: Upload Frontend to cPanel

1. **Access File Manager** in cPanel
2. **Navigate to public_html** (or your domain folder)
3. **Upload Frontend Files**:
   - If using static export: Upload contents of `out/` folder
   - If using Next.js server: Upload entire project (excluding `node_modules`)

4. **Install Dependencies** (if not using static export):
   ```bash
   npm install --production
   ```

### Step 3: Deploy Backend on cPanel

1. **Create Subdomain** (e.g., `api.yourdomain.com`)
2. **Upload Backend Files** to subdomain folder
3. **Install Dependencies**:
   ```bash
   npm install --production
   ```

4. **Configure Environment**:
   Create `.env` file with production values:
   ```env
   PORT=3001
   OPENAI_API_KEY=your_production_openai_key
   LARAVEL_API_URL=https://your-laravel-api.com/api
   JWT_SECRET=your_production_jwt_secret
   NODE_ENV=production
   ```

### Step 4: Configure Node.js in cPanel

1. **Access Node.js Selector** in cPanel
2. **Create New Application**:
   - **Node.js Version**: 18+ (latest LTS)
   - **Application Root**: Path to your backend folder
   - **Application URL**: Your API subdomain
   - **Application Startup File**: `dist/server.js`

3. **Set Environment Variables** in Node.js app settings
4. **Start the Application**

### Step 5: Configure Frontend Environment

1. **Update Frontend Environment** for production:
   ```env
   NEXT_PUBLIC_API_URL=https://backendcv.onlinetoolpot.com/api

   # Laravel API URL for authentication on staging
   NEXT_PUBLIC_API_URL=https://stagingbackend.resumaic.com/api

   # Node.js API URL for AI operations on production
   NEXT_PUBLIC_NODEJS_API_URL=  http://localhost:3001

   # Node.js API URL for AI operations on staging
   NEXT_PUBLIC_NODEJS_API_URL=https://stagingnode.resumaic.com
   ```

2. **Rebuild Frontend** with production URLs:
   ```bash
   npm run build
   ```

3. **Re-upload** updated build files

### Step 6: SSL and Domain Configuration

1. **Enable SSL** for both frontend and backend domains
2. **Configure DNS** if using custom domains
3. **Update CORS settings** in backend if needed

## 🔒 Security Considerations

- Always use HTTPS in production
- Keep API keys secure and never commit them
- Configure proper CORS settings
- Use strong JWT secrets
- Regularly update dependencies

## 📝 Environment Variables Reference

### Frontend (.env.local)
```env
# Laravel API URL for authentication on staging
NEXT_PUBLIC_API_URL=https://backendcv.onlinetoolpot.com/api

# Laravel API URL for authentication on staging
NEXT_PUBLIC_API_URL=https://stagingbackend.resumaic.com/api

# Node.js API URL for AI operations on production
NEXT_PUBLIC_NODEJS_API_URL=  http://localhost:3001

# Node.js API URL for AI operations on staging
NEXT_PUBLIC_NODEJS_API_URL=https://stagingnode.resumaic.com
```

### Backend (.env)
```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key
LARAVEL_API_URL=https://your-laravel-api.com/api
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## 🛠️ Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Export static files

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **API Timeouts**: Ensure 60-second timeout for AI operations
3. **Build Failures**: Check Node.js version compatibility
4. **Authentication Issues**: Verify Laravel API endpoints

### cPanel Specific Issues

1. **Node.js App Won't Start**: Check startup file path and permissions
2. **Environment Variables**: Ensure they're set in cPanel Node.js settings
3. **File Permissions**: Set appropriate permissions (755 for directories, 644 for files)

## 📞 Support

For deployment issues or questions, check:
- cPanel documentation for Node.js applications
- Next.js deployment guides
- Express.js production best practices

## 🔄 Updates

To update the application:
1. Pull latest changes
2. Rebuild both frontend and backend
3. Re-upload to cPanel
4. Restart Node.js application in cPanel

---

**Note**: This application requires both Laravel API (for authentication) and Node.js backend (for AI operations) to function properly. Ensure both services are running and accessible.
