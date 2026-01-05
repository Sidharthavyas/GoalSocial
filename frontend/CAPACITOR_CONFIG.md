# Capacitor Configuration Guide

## Quick Start - Testing on Android

### Step 1: Get Your Computer's IP Address
Open Command Prompt and run:
```bash
ipconfig
```

Look for your **IPv4 Address** under your active network adapter.
Example: `192.168.1.100`

### Step 2: Update API Configuration
Edit `frontend/src/utils/capacitorConfig.js`:

Replace:
```javascript
const MOBILE_DEV_API_URL = 'http://YOUR_COMPUTER_IP:5000';
```

With your actual IP:
```javascript
const MOBILE_DEV_API_URL = 'http://192.168.1.100:5000';
```

### Step 3: Build and Run
```bash
cd frontend
npm run build
npm run cap:sync:android
npm run cap:open:android
```

### Step 4: In Android Studio
1. Wait for Gradle sync to complete
2. Click the green "Run" button
3. Select your device/emulator
4. Wait for app to install and launch

## Important Security Note

### Backend CORS Configuration
Your backend must allow connections from the mobile app.

Edit `backend/server.js` - the CORS configuration should already allow your local network:

```javascript
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        /^http:\/\/192\.168\.\d+\.\d+:5173$/,  // Allows local network IPs
        // Add your production domain when deploying
    ],
    credentials: true
};
```

This is already configured! ✅

## For Production Deployment

When deploying to production:

1. **Deploy your backend** to a hosting service (Railway, Render, Heroku, etc.)
2. **Get your production API URL** (e.g., `https://api.goaltracker.com`)
3. **Update** `frontend/src/utils/capacitorConfig.js`:
   ```javascript
   const PRODUCTION_API_URL = 'https://api.goaltracker.com';
   ```
4. **Build production APK** in Android Studio
5. **Upload to Google Play Store**

## Troubleshooting

### Can't connect to API
**Problem:** Mobile app shows "Network Error" or blank screen

**Solutions:**
1. Make sure backend is running (`npm start` in backend folder)
2. Check your computer's IP is correct in `capacitorConfig.js`
3. Make sure phone and computer are on the same WiFi network
4. Check Windows Firewall isn't blocking port 5000
5. Try disabling VPN if you're using one

### WebSocket not connecting
**Problem:** Real-time features don't work

**Solution:**
Check the WebSocket URL in your SocketContext. It should use the mobile configuration helper.

### App shows blank white screen
**Problem:** App launches but shows nothing

**Solutions:**
1. Open Logcat in Android Studio (View → Tool Windows → Logcat)
2. Look for JavaScript errors
3. Check if `dist/` folder exists and has files
4. Try: `npm run build && npm run cap:sync:android`

## Development Workflow

1. **Make changes** to React code in `src/`
2. **Test in browser** first: `npm run dev`
3. **Build for mobile:**
   ```bash
   npm run build
   npm run cap:sync:android
   ```
4. **Refresh in Android Studio** or rebuild app

## Benefits of This Setup

✅ **Web app unchanged** - runs exactly as before
✅ **Same codebase** - maintain one project for web + mobile
✅ **Easy testing** - test in browser, then sync to mobile
✅ **Hot reload** - use browser for rapid development
✅ **Native features** - add camera, push notifications later
