# setup-env.ps1
Write-Host "Setting up environment files..." -ForegroundColor Green

# Frontend .env.development
$frontendDev = @"
# VITE PROJECT - Your project uses Vite, not Create React App
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyAMqzWajDPJ0__aOlw1DimIQeNfi3RVqpQ
VITE_FIREBASE_AUTH_DOMAIN=smartcitylogistics-4b6f7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smartcitylogistics-4b6f7
VITE_FIREBASE_STORAGE_BUCKET=smartcitylogistics-4b6f7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1084235957683
VITE_FIREBASE_APP_ID=1:1084235957683:web:b7f13bf9bf51fed568f7c6
"@

$frontendDev | Out-File -FilePath "frontend/.env.development" -Encoding UTF8
Write-Host "Created frontend/.env.development" -ForegroundColor Yellow

# Frontend .env.production
$frontendProd = @"
VITE_API_URL=https://your-production-api.com
VITE_FIREBASE_API_KEY=AIzaSyAMqzWajDPJ0__aOlw1DimIQeNfi3RVqpQ
VITE_FIREBASE_AUTH_DOMAIN=smartcitylogistics-4b6f7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smartcitylogistics-4b6f7
VITE_FIREBASE_STORAGE_BUCKET=smartcitylogistics-4b6f7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1084235957683
VITE_FIREBASE_APP_ID=1:1084235957683:web:b7f13bf9bf51fed568f7c6
"@

$frontendProd | Out-File -FilePath "frontend/.env.production" -Encoding UTF8
Write-Host "Created frontend/.env.production" -ForegroundColor Yellow

# Backend .env
$backendEnv = @"
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/smartcity_logistics

# JWT Secret
JWT_SECRET=smartcity_logistics_secret_key_2024_change_this

# Admin
ADMIN_EMAIL=admin@smartcity.com
ADMIN_PASSWORD=admin123

# Debug
DEBUG=true
"@

$backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8
Write-Host "Created backend/.env" -ForegroundColor Yellow

Write-Host "Environment files created successfully!" -ForegroundColor Green