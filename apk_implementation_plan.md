# 📱 Android APK Implementation Plan

This plan outlines the steps to package the **Nifty 50 Heatmap** into a native Android application using **Capacitor**.

## 🏗️ Project Architecture for Mobile
The app will function as a **Web-to-Native Hybrid**, where your existing HTML/JS/CSS assets are wrapped in an Android project.

### 🔗 API Connectivity
Since the APK runs as a local file (`file://` protocol), relative URLs like `/api/nifty50` will NOT work. I have updated `public/script.js` to automatically use an absolute URL when running in a mobile environment.

> [!IMPORTANT]
> You MUST replace the placeholder URL in `public/script.js` (line 92) with your actual deployed **Cloudflare Worker URL**.

---

## 🛠️ Step-by-Step Build Process

### 1️⃣ Local Dependencies
Ensure you have **Node.js** and **Android Studio** installed on your Mac. Since the agent environment has permission restrictions, you should run these commands in your local terminal:

```bash
# 1. Install Capacitor dependencies
npm install @capacitor/cli @capacitor/core @capacitor/android

# 2. Sync your latest web assets and initialize Android project
npm run android:build
```

### 2️⃣ Generating the APK
Once Capacitor has initialized the Android project, open it in Android Studio to build the final APK:

```bash
# Open the project in Android Studio
npm run android:open
```

**Inside Android Studio:**
1. Wait for Gradle to finish indexing (it might take a minute).
2. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once finished, a notification will appear with a "Locate" link to your `app-debug.apk`.

---

## 🚀 Future Automations
I have added the following scripts to your `package.json`:
- `npm run build`: Syncs root assets to the `public/` directory.
- `npm run sync`: Fast-syncs only web changes to the Android app.
- `npm run android:build`: Full initialization and sync.
- `npm run android:open`: Opens the project in Android Studio.

---

### ✅ Checklist for Production
- [ ] Update `API_BASE_URL` in `public/script.js`.
- [ ] Add an icon in `android/app/src/main/res/drawable` (Capacitor Asset tool can automate this).
- [ ] Sign the APK in Android Studio for distribution.
