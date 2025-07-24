#!/bin/bash
echo "🎬 Setting up GyűrűkUra 10-27 LOTR Marathon App..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p static
mkdir -p public/images
mkdir -p public/audio
mkdir -p src/assets/images
mkdir -p src/assets/fonts
mkdir -p services
mkdir -p templates/emails

echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "1. Terminal 1: python app.py"
echo "2. Terminal 2: npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:2006"
