# 📱 How to Create Android APK from PWA

## Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click **Sign up** and create a free account

---

## Step 2: Create a New Repository
1. Log into GitHub
2. Click **+** at the top right, then **New repository**
3. Repository name: `moulin-royal-mobile`
4. Select **Public**
5. Click **Create repository**

---

## Step 3: Upload App Files
### Easy Method (from browser):
1. On the new repository page, click **uploading an existing file**
2. Drag all files from the `mobile` folder:
   - `index.html`
   - `manifest.json`
   - `receiver.js`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
3. Click **Commit changes**

---

## Step 4: Enable GitHub Pages
1. Go to **Settings** (repository settings)
2. In the sidebar, click **Pages**
3. Under **Source**, select: **Deploy from a branch**
4. Choose **main** branch and **/ (root)**
5. Click **Save**
6. Wait 2-3 minutes...
7. You'll see: **Your site is live at `https://USERNAME.github.io/moulin-royal-mobile/`**

📝 **Copy this URL!** You'll need it in the next step.

---

## Step 5: Generate APK using PWA Builder
1. Go to [pwabuilder.com](https://www.pwabuilder.com)
2. Paste your GitHub Pages URL
3. Click **Start**
4. Wait for analysis...
5. Click **Package for stores**
6. Select **Android**
7. In settings:
   - **App name**: Moulin Royal
   - **Package ID**: com.moulinroyal.receiver
   - **App version**: 4.0.0
8. Click **Generate**
9. Download the APK file!

---

## Step 6: Install APK on Phone
1. Transfer the APK file to your Android phone
2. Open the file and install
3. You may need to enable "Install from unknown sources" in settings

---

## 🎉 Done!
You now have a real Android app that works offline!

---

## Important Notes:
- PWA Builder is completely free
- You don't need Android Studio or any special software
- You can publish to Google Play Store later if you want

---

## Alternative: Quick Method (without GitHub)
If you have web hosting (like moulinroyal.net):
1. Upload the `mobile` folder files to a subfolder (e.g., `/app/`)
2. Go to [pwabuilder.com](https://pwabuilder.com)
3. Enter the URL `https://moulinroyal.net/app/`
4. Download APK!
