# CareSync — Smart Hospital Management System 🏥✨

CareSync is a premium, demo-ready Smart Hospital Management System built as a high-fidelity frontend MVP with a serverless Firebase integration.

## 🚀 Live Demo Features
- **Role-Based Dashboards**: Specialized interfaces for Admins, Doctors, and Patients.
- **Cloud Persistence**: Fully integrated with **Firebase Auth** and **Firestore** for real-time data sync.
- **Google Login**: One-click authentication for a modern user experience.
- **Professional Rx**: Automated Prescription PDF generation with integrated QR codes.
- **Rich Analytics**: Interactive medical charts using Chart.js.
- **Audit Logs**: Complete traceability for every action taken in the system.
- **Premium UI**: Glassmorphic design with AOS (Animate On Scroll) and responsive layouts.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript.
- **Backend (Serverless)**: Firebase Authentication, Firebase Firestore.
- **Libraries**: AOS (Animations), Chart.js (Data Viz), jsPDF (Reports), qrcodejs (Verification).

---

## 💻 Local Setup

1. **Clone the project** or open the folder in VS Code.
2. **Firebase Configuration**:
   - The project is pre-configured with a demo Firebase project.
   - To use your own, update the keys in `assets/js/firebase-config.js`.
3. **Run Locally**:
   - Use the VS Code **Live Server** extension to open `index.html`.
   - Alternatively, simply open `index.html` in any modern browser.

---

## ☁️ Netlify Deployment Instructions

CareSync is designed for zero-config deployment on Netlify.

### Option 1: Drag & Drop (Fastest)
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the **entire project folder** onto the page.
3. Your site will be live in seconds!

### Option 2: Git Deployment (Recommended)
1. Push your code to a GitHub/GitLab repository.
2. Log in to your [Netlify Dashboard](https://app.netlify.com/).
3. Click **"Add new site"** -> **"Import an existing project"**.
4. Select your repository.
5. **Build Settings**:
   - **Build Command**: Leave blank (it's a static site).
   - **Publish directory**: `.` (or the folder name if you put it in a subdirectory).
6. Click **Deploy**.

---

## 🛑 Post-Deployment Checklist
To ensure all features work correctly on your live URL:

1. **Firebase Authorized Domains**:
   - Go to your **Firebase Console** -> **Authentication** -> **Settings** -> **Authorized Domains**.
   - Add your new Netlify URL (e.g., `your-site.netlify.app`) to the list. This allows Google Login to work on your live site.
2. **Firestore Rules**:
   - Ensure your Firestore rules are set to **Test Mode** or allow authenticated users to read/write.

---

## 📁 Project Structure
```text
/
├── assets/
│   ├── css/          # Custom styles & Tailwind overrides
│   └── js/           # Core logic (app.js, firebase-config.js, etc.)
├── backend/          # Optional Node.js/MongoDB code (for future use)
├── admin-*.html      # Administrator dashboards
├── doctor-*.html     # Doctor workflow pages
├── patient-*.html    # Patient portal pages
├── login.html        # Unified cloud login
└── index.html        # Landing page
```

© 2026 CareSync Medical Systems · Demo / Educational Use Only
