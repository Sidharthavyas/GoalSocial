# GoalTracker - Mobile App Setup Guide

## 🎉 Capacitor Successfully Installed!

Your web app is now ready to be converted into a native mobile app. **Your existing web version is completely safe and unchanged.**

## What Was Done

✅ **Installed Capacitor packages**
- @capacitor/core
- @capacitor/cli
- @capacitor/android

✅ **Created Android project** in `android/` folder

✅ **Added build scripts** to `package.json`

✅ **Configured Capacitor** in `capacitor.config.json`

✅ **Updated Vite config** for mobile builds

## How It Works

You now have **TWO separate versions** from the same codebase:

### 1. Web Version (Unchanged ✅)
```bash
npm run dev      # Development server
npm run build    # Production build
```
Your web app works exactly as before!

### 2. Mobile Version (New! 📱)
```bash
npm run cap:run:android    # Build and open in Android Studio
```
Creates a native Android app!

## Next Steps

### For Android Development

1. **Build your web app first:**
   ```bash
   npm run build
   ```

2. **Sync to Android:**
   ```bash
   npm run cap:sync:android
   ```

3. **Open in Android Studio:**
   ```bash
   npm run cap:open:android
   ```

4. **In Android Studio:**
   - Connect Android device or start emulator
   - Click "Run" button (green play icon)
   - Your app will install and launch!

### For iOS Development (macOS only)

1. **Build your web app:**
   ```bash
   npm run build
   ```

2. **Add iOS platform:**
   ```bash
   npm run cap:add:ios
   ```

3. **Sync to iOS:**
   ```bash
   npm run cap:sync:ios
   ```

4. **Open in Xcode:**
   ```bash
   npm run cap:open:ios
   ```

## Important Notes

### Your Web App is Safe! ✅
- Web version runs with `npm run dev` (unchanged)
- Mobile version runs with `npm run cap:run:android`
- **They are completely separate!**
- Both use the same source code

### Development Workflow

**For Web Development:**
```bash
npm run dev
```
Just like before! Nothing changed.

**For Mobile Development:**
```bash
# 1. Make code changes in src/
# 2. Build
npm run build

# 3. Sync to mobile
npm run cap:sync:android

# 4. Open in Android Studio
npm run cap:open:android
```

### API Configuration

**Current Setup (Development):**
- Web app connects to `http://localhost:5000` (via Vite proxy)
- Mobile app connects to your computer's local server

**For Production:**
You'll need to update API URLs to point to your deployed backend.
Edit `capacitor.config.json` and remove the `server.url` section.

## Testing Your Mobile App

### On Android Emulator
1. Open Android Studio
2. Tools → Device Manager
3. Create/Start a virtual device
4. Run `npm run cap:run:android`

### On Physical Android Device
1. Enable Developer Options on your phone
2. Enable USB Debugging
3. Connect phone via USB
4. Run `npm run cap:run:android`
5. Select your device in Android Studio

## File Structure

```
frontend/
├── src/              # Your React code (SAME for web & mobile)
├── dist/             # Built web assets
├── android/          # Native Android project (NEW)
├── ios/              # Native iOS project (when added)
├── capacitor.config.json  # Capacitor config
├── package.json      # Updated with mobile scripts
└── vite.config.js    # Updated for mobile builds
```

## Available Scripts

### Web Development (Original)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Mobile Development (New)
- `npm run cap:sync` - Build and sync to all platforms
- `npm run cap:sync:android` - Build and sync to Android
- `npm run cap:run:android` - Build, sync, and open Android Studio
- `npm run cap:open:android` - Open Android project in Android Studio
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:sync:ios` - Build and sync to iOS
- `npm run cap:open:ios` - Open iOS project in Xcode

## Common Issues & Solutions

### Issue: "Android Studio not found"
**Solution:** Install Android Studio from https://developer.android.com/studio

### Issue: "Build failed"
**Solution:** Run `npm run build` first to create the `dist/` folder

### Issue: "Cannot connect to API"
**Solution:** 
- Make sure your backend is running (`npm start` in backend folder)
- Update `capacitor.config.json` with your computer's IP address

### Issue: "App shows blank screen"
**Solution:**
1. Check browser console in Android Studio (View → Tool Windows → Logcat)
2. Make sure `npm run build` was successful
3. Check API URLs in network tab

## Building for Production

### Android APK
1. Update `capacitor.config.json` (remove development server URL)
2. Build: `npm run build`
3. Sync: `npm run cap:sync:android`
4. Open Android Studio: `npm run cap:open:android`
5. Build → Generate Signed Bundle/APK
6. Follow Android Studio wizard

### iOS App
1. Same steps but use iOS commands
2. Requires Apple Developer account ($99/year)
3. Use Xcode for signing and submission

## Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Studio**: https://developer.android.com/studio
- **Xcode**: https://developer.apple.com/xcode/

## Summary

✅ **Web app still works exactly the same**
✅ **Mobile app uses the same codebase**
✅ **No code changes required**
✅ **Both can be developed independently**

You now have a multi-platform app from a single codebase! 🎉
