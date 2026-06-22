# SyncChat — Real-Time_Chat-Application (MERN + Socket.io)

SyncChat is a scalable, real-time messaging application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io. It features instant bi-directional messaging, live online/offline presence tracking, unread message badges, visual typing indicators, and media sharing.

The frontend is designed with a premium, responsive dark-themed **glassmorphism** layout utilizing modern typography (Outfit & Plus Jakarta Sans) and micro-animations.

---

## 🚀 Key Features

* **🔄 Real-Time Communication**: Bi-directional event transmission powered by Socket.io for instant message delivery without page reloads.
* **🔑 Secure JWT Authentication**: Robust registration and login sessions using JSON Web Tokens (JWT) and secure password hashing via `bcryptjs`.
* **🟢 Live User Presence**: Dynamic tracking showing active users with green online badges and gray offline indicators.
* **💬 Typing Status Indicators**: Real-time feedback showing when a contact is currently drafting a message.
* **🔔 Unread Message Counter**: Auto-incrementing notification badges for incoming messages in background chat feeds.
* **📁 Media Sharing**: Support for uploading images and document files (up to 10MB) via a **Multer** backend file upload pipeline.
* **🎨 Modern UI/UX**: Custom responsive layout with clean CSS styling, interactive hover behaviors, and auto-scrolling message streams.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (Vite SPA template)
* **Socket.io-client** (WebSocket client library)
* **React Router Dom** (SPA routing and route protection guards)
* **Lucide React** (Premium UI icons)
* **Vanilla CSS** (Custom glassmorphic styles and custom scrollbars)

### Backend
* **Node.js** & **Express.js** (RESTful API backend)
* **Socket.io** (WebSocket server management)
* **MongoDB** & **Mongoose** (Database storage and schemas)
* **jsonwebtoken** (Token signing and route verification middleware)
* **bcryptjs** (Password cryptography)
* **Multer** (File system storage routing for uploads)

---

## 📂 Project Structure

```
realtime-chat-app/
├── backend/            # Express, Node, Socket.io, & MongoDB
│   ├── config/         # DB configurations
│   ├── controllers/    # API handler controllers (Auth & Messages)
│   ├── middleware/     # JWT authentication guards
│   ├── models/         # Database models (User & Message)
│   ├── routes/         # REST API endpoints mapping
│   ├── socket/         # Socket connection tracking maps
│   └── server.js       # Main backend server runner
└── frontend/           # React + Vite client app
    ├── src/
    │   ├── components/ # Modular UI components (Sidebar, ChatArea, MessageInput)
    │   ├── context/    # Global Auth & Socket providers
    │   ├── pages/      # Route layouts (Home, Login, Register)
    │   └── App.jsx     # Route guarding & main routes setup
    └── vite.config.js  # Vite server and reverse proxies
```

---

## ⚙️ Environment Variables

Create a `.env` file in your `/backend` directory and configure the variables:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
JWT_SECRET=your_jwt_secret_key_here
# Separate multiple deployed frontend origins with commas.
FRONTEND_URL=http://localhost:5173,https://real-time-chat-application-five-beta.vercel.app
NODE_ENV=development
```

---

## 🚀 Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org) (v18+)
* [MongoDB](https://www.mongodb.com) (Local daemon or MongoDB Atlas cloud URI)

### Local Startup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/realtime-chat-app.git
   cd realtime-chat-app
   ```

2. **Run Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The server boots on port `5001`.*

3. **Run Frontend Client**:
   Open a second terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The website runs on `http://localhost:5173`.*

---

## 🧪 How to Verify
1. Navigate to `http://localhost:5173` and register **User A**.
2. Open a new **Incognito (Private) browser tab** and register **User B**.
3. You will immediately see each other online in the sidebars. Open a chat and enjoy real-time messaging, typing events, and file sharing!





-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




<img width="1470" height="956" alt="Screenshot 2026-06-21 at 11 50 04 PM" src="https://github.com/user-attachments/assets/d534a6a7-17ff-4b56-877e-47990f5b1068" />
<img width="1470" height="956" alt="Screenshot 2026-06-21 at 11 49 32 PM" src="https://github.com/user-attachments/assets/c2a5e95b-eb65-457f-8bed-dfb5f91184c6" />
<img width="1470" height="956" alt="Screenshot 2026-06-21 at 11 48 57 PM" src="https://github.com/user-attachments/assets/daab02de-f3b5-4e47-bc3c-bc8928ac3a87" />


