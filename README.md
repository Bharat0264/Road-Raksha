# 🚧 RoadRaksha — Citizen Road Damage Reporting App

A full-stack MERN application where citizens can report road damage with photo evidence, track resolution via ticket timeline, earn points & badges, and view a live damage map.

---

## 🌟 Features

- **Auth** — Signup (name, email, mobile, city, state), Login, Forgot Password (OTP via email)
- **Report Damage** — Upload photo, get GPS location, AI-powered image verification (Anthropic Claude)
- **Ticket Tracking** — Amazon-style step-by-step progress: Submitted → Under Review → Assigned → Work in Progress → Resolved
- **Live Map** — Leaflet map showing all nearby unresolved damage reports with severity markers
- **Points & Badges** — Earn points per valid report, unlock badges (Road Watcher, Responsible Citizen, Community Hero, Road Guardian, City Champion)
- **Email Notifications** — Auto-email to authority (`bharatsaipulipati@zohomail.in`) + user confirmation email
- **MongoDB** — All user and report data stored persistently

---

## 📁 Project Structure

```
roadcare-app/
├── backend/
│   ├── models/         # Mongoose schemas (User, Report)
│   ├── routes/         # Express routes (auth, reports)
│   ├── middleware/     # JWT auth middleware
│   ├── utils/          # Email, AI analysis, Cloudinary upload
│   ├── server.js       # Express app entry
│   └── .env.example    # Required env vars
└── frontend/
    ├── public/
    └── src/
        ├── context/    # AuthContext (global user state)
        ├── pages/      # Login, Signup, Dashboard, Report, MyReports, Map, Profile
        ├── components/ # Sidebar
        └── index.css   # Global design system
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Bharat0264/roadcare-app.git
cd roadcare-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values (see below)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) — Create cluster → Connect → Get connection string |
| `JWT_SECRET` | Any random 32+ char string |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail [App Password](https://myaccount.google.com/apppasswords) (not your regular password) |
| `AUTHORITY_EMAIL` | `bharatsaipulipati@zohomail.in` (already set in code) |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary](https://cloudinary.com) → Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary → Settings → API Keys |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Pushing to GitHub

```bash
# In the root folder
git init
git add .
git commit -m "Initial commit: RoadCare app"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/roadcare-app.git
git branch -M main
git push -u origin main
```

---

## 🎯 How the App Works

1. **User signs up** with name, email, mobile, city, state → stored in MongoDB
2. **User logs in** → JWT token issued, stored in localStorage
3. **User reports damage** → uploads photo + GPS location → sent to backend
4. **AI Analysis** → Anthropic Claude analyzes if image shows road damage
5. **If valid** → Report saved → Authority emailed → User confirmation emailed → Points awarded
6. **If invalid** → Report rejected with reason shown to user
7. **Ticket tracking** → User sees status timeline like an order tracker
8. **Map** → All active reports shown on Leaflet map with color-coded severity
9. **Points & Badges** → Earned automatically on valid report submission

---

## 📊 Ticket Status Flow

| Status | Label | Meaning |
|---|---|---|
| `submitted` | Report Submitted | Report logged in system |
| `under_review` | Under Review | Authority reviewing |
| `assigned` | Team Assigned | Repair crew allocated |
| `work_in_progress` | Repair Underway | Active work happening |
| `resolved` | Issue Resolved | Road repaired & verified |

---

## 🏅 Points & Badges

| Severity | Points |
|---|---|
| Low | 10 pts |
| Medium | 15 pts |
| High | 20 pts |
| Critical | 25 pts |

| Badge | Points Required |
|---|---|
| 👀 Road Watcher | 10 |
| 🏆 Responsible Citizen | 50 |
| 🦸 Community Hero | 100 |
| 🛡️ Road Guardian | 250 |
| 🌟 City Champion | 500 |

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Axios, Leaflet (maps), React Hot Toast
- **Backend**: Node.js, Express, Mongoose, JWT, Multer, Nodemailer
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (image uploads)
- **AI**: Anthropic Claude (image verification)
- **Email**: Nodemailer via Gmail SMTP

---

Built with ❤️ to make Indian roads safer.
"# Road-Raksha" 
---
Project Demo

## 📸 Screenshots

## 📸 Screenshots

<p align="center">
  <img src="dashboard.png" width="45%">
  <img src="login.png" width="45%">
</p>

<p align="center">
  <img src="maps.png" width="45%">
  <img src="report.png" width="45%">
</p>
