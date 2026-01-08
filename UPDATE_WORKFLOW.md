# OTA Live Updates Deployment Workflow

## Overview
This document explains how to deploy Over-The-Air (OTA) updates to the GoSocial mobile app using Capgo.

## Prerequisites
- Capgo CLI installed (`@capgo/cli`)
- Capgo account (free tier available)
- App built and deployed to devices

## Deploying an Update

### 1. Make Your Changes
Edit any frontend code (HTML, CSS, JavaScript, React components).

**Example changes:**
- Fix a bug
- Update UI text
- Change colors
- Add new features (that don't require native code)

### 2. Build the App
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 3. Upload to Capgo
```bash
npm run deploy:live
```

Or manually:
```bash
npx @capgo/cli bundle upload
```

### 4. Monitor Deployment
- Updates are pushed to all active devices
- Devices download updates in the background
- Users see notification: "🎉 New update available! Restart to apply."
- Update installs on next app restart

## Update Flow

```
Developer → Build → Upload → Capgo → Devices → Install on Restart
```

## Version Management

### Check Current Version
```bash
npx @capgo/cli bundle list
```

### Rollback to Previous Version
If an update causes issues:
```bash
npx @capgo/cli bundle rollback
```

## What Can Be Updated via OTA

✅ **Can Update:**
- UI changes (HTML, CSS)
- JavaScript code
- React components
- Images and assets
- API endpoints
- Business logic

❌ **Cannot Update (Requires App Store):**
- Native code changes
- New Capacitor plugins
- Permission changes
- App binary updates

## Testing Updates

### Test on Device
1. Install app on physical device
2. Make a small change (e.g., change button text)
3. Run `npm run deploy:live`
4. Open app on device
5. Wait for update notification
6. Restart app
7. Verify change is live

### Test Rollback
1. Deploy a broken version intentionally
2. Verify app detects issue
3. Run rollback command
4. Verify app returns to working state

## Best Practices

### Before Deploying
- ✅ Test changes locally
- ✅ Build and verify no errors
- ✅ Check console for warnings
- ✅ Test on multiple screen sizes

### After Deploying
- ✅ Monitor Capgo dashboard for errors
- ✅ Check update adoption rate
- ✅ Watch for crash reports
- ✅ Be ready to rollback if needed

## Deployment Schedule

**Recommended:**
- **Bug Fixes**: Deploy immediately
- **Minor Features**: Deploy during off-peak hours
- **Major Updates**: Deploy with announcement

## Monitoring

### Capgo Dashboard
Access at: https://capgo.app/dashboard

**Metrics Available:**
- Update success rate
- Active version distribution
- Device analytics
- Error logs

## Troubleshooting

### Update Not Appearing
1. Check Capgo dashboard for upload success
2. Verify app is checking for updates
3. Check device internet connection
4. Force close and reopen app

### Update Failed
1. Check error logs in Capgo dashboard
2. Verify build completed successfully
3. Test update locally first
4. Rollback if necessary

### Rollback Not Working
1. Ensure previous version exists
2. Check Capgo CLI is authenticated
3. Contact Capgo support if needed

## Security

- All updates are code-signed
- HTTPS-only transmission
- Version validation prevents unauthorized updates
- Automatic rollback on critical errors

## Cost

**Capgo Pricing:**
- Free: 100 MAU (Monthly Active Users)
- Starter: $15/month, 1000 MAU
- Growth: $99/month, 10000 MAU

**Current Plan:** Free tier (sufficient for initial launch)

## Support

- Capgo Docs: https://capgo.app/docs
- GitHub Issues: https://github.com/Cap-go/capacitor-updater
- Discord: https://discord.gg/VnYRvBfgA6

## Quick Reference

```bash
# Deploy update
npm run deploy:live

# List versions
npx @capgo/cli bundle list

# Rollback
npx @capgo/cli bundle rollback

# Check status
npx @capgo/cli status
```
