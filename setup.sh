#!/bin/bash

echo "🚀 Setting up Stock Tracker..."

# Create environment file for backend
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please update with your configurations"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Install Angular CLI globally if not installed
if ! command -v ng &> /dev/null; then
    echo "🔧 Installing Angular CLI globally..."
    npm install -g @angular/cli
fi

cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && ng serve"
echo ""
echo "Then visit: http://localhost:4200"
