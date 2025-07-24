# GyűrűkUra 10-27 - LOTR Marathon App

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Install Python dependencies:**
   \`\`\`bash
   pip install flask flask-cors
   \`\`\`

2. **Install Node.js dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

### Running the Application

#### Option 1: Manual Start (Recommended for development)

1. **Start Flask Backend (Terminal 1):**
   \`\`\`bash
   python app.py
   \`\`\`
   - Backend runs on: `http://localhost:2020`
   - API endpoints: `http://localhost:2020/api/`

2. **Start Vite Frontend (Terminal 2):**
   \`\`\`bash
   npm run dev
   \`\`\`
   - Frontend runs on: `http://localhost:2006`

#### Option 2: Using Scripts

**Linux/Mac:**
\`\`\`bash
chmod +x scripts/dev.sh
./scripts/dev.sh
\`\`\`

**Windows:**
\`\`\`cmd
scripts\dev.bat
\`\`\`

### Accessing the Application

#### Local Development:
- **Frontend:** http://localhost:2006
- **Backend API:** http://localhost:2020/api/
- **Health Check:** http://localhost:2020/api/health

#### Network Access (Other Devices):
Replace `localhost` with your machine's IP address:
- **Frontend:** http://YOUR_IP:2006
- **Backend:** http://YOUR_IP:2020

#### Finding Your IP Address:

**Windows:**
\`\`\`cmd
ipconfig
\`\`\`
Look for "IPv4 Address" under your active network adapter.

**Linux/Mac:**
\`\`\`bash
hostname -I
# or
ifconfig | grep "inet "
\`\`\`

### Example Network URLs:
If your IP is `192.168.1.100`:
- Frontend: http://192.168.1.100:2006
- Backend: http://192.168.1.100:2020

### Production Build

1. **Build the frontend:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Run Flask (serves both frontend and API):**
   \`\`\`bash
   python app.py
   \`\`\`
   - Everything available at: http://localhost:2020

### Troubleshooting

#### Port Already in Use:
- **Frontend (2006):** Change port in `package.json` or `vite.config.js`
- **Backend (2020):** Change port in `app.py`

#### CORS Issues:
- Ensure Flask CORS is configured for your frontend URL
- Check `app.py` CORS origins configuration

#### Network Access Issues:
- Check firewall settings
- Ensure both services are running with `host='0.0.0.0'`
- Verify IP address is correct

### File Structure:
\`\`\`
project/
├── src/                 # React frontend
├── static/             # Backend data files
├── public/             # Static assets
├── services/           # Flask services
├── scripts/            # Development scripts
├── app.py             # Flask backend
├── package.json       # Node.js config
└── vite.config.js     # Vite config
