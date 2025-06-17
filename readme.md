# 🏅 Sports Management System

A modern full-stack web application to digitize and streamline all sports-related activities in educational institutions. Built with the **MERN stack** and designed to empower administrators, coaches, and students with real-time updates, analytics, and efficient sports coordination.

---

## 🚀 Features

- 👥 **User Roles**: Admin, Coach, Player
- 📋 **Player Profiles**: Personal info, performance, injuries
- 🗓️ **Event Scheduler**: Matches, training sessions, tournaments
- 📊 **Performance Analytics**: Real-time charts using Recharts
- 💬 **Chat Module**: AI-assisted or manual messaging
- 🔔 **Notifications**: In-app + real-time alerts via WebSockets
- 🧾 **Attendance Tracker**: Practice and match attendance logs
- 🛠️ **Inventory Management**: Sports gear tracking
- 📄 **Feedback & Ratings**: Coaches and players can review events

---

## 🛠️ Tech Stack

**Frontend**  
React.js + Tailwind CSS + Redux Toolkit + Vite + Recharts

**Backend**  
Node.js + Express.js + MongoDB + Socket.IO + JWT Auth

**Deployment**  
Frontend → Vercel  
Backend → Render / Heroku

---


## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/likhithb08/SportsManagementSystem1.0.git/
cd sports-management-system
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Backend
```bash
cd backend
npm install
npm run dev
```

> 📦 Make sure to add your `.env` for Mongo URI and JWT secret:
```bash
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key

---

## 📚 Project Structure
```
sports-management-system/
├── client/             # React frontend
│   ├── components/
│   └── pages/
├── server/             # Express backend
│   ├── models/
│   ├── routes/
│   └── controllers/
├── .env
└── README.md
```

---

## 👤 Team Members

- **Likhith B** – U24AN22S0079
- **Supriya S** – U24AN22S0394
- **Aparna V ** – U24AN22S0090

---

## 🧩 Future Enhancements

- 📱 Mobile App (React Native)
- 🌐 Multilingual Support
- 🤖 Smart AI Insights for Player Suggestions
- 📤 Exportable Reports (PDF, Excel)
- 🔒 2FA and OAuth Login

---


> Made with ❤️ by the Final Year BCA Team