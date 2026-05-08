# 💬 Chat App API

A fully-featured real-time chat API built with Node.js, Express, Socket.IO, and MongoDB.

---

## 🚀 Features

- 🔐 **Authentication & Authorization** — JWT-based auth with role-based access control
- 👤 **User Management** — Register, Login, Profile, Change Password, Forgot/Reset Password
- 🏠 **Rooms** — Public, Private, and Group rooms with admin controls
- 💬 **Messages** — Send, Edit, Delete, React, and Read receipts
- 📩 **Direct Messages** — One-to-one private conversations
- ⚡ **Real-time** — Socket.IO for instant messaging, typing indicators, and online status
- 🖼️ **Image Upload** — Avatar and message image upload with Multer
- 🔍 **Search** — Search users and rooms
- 🛡️ **Security** — Rate limiting, CORS, Helmet, MongoDB sanitization
- 🚦 **Redis** — Caching, online users store, and distributed rate limiting
- 📝 **Logging** — HTTP request logging with Morgan
- ✅ **Validation** — Request validation with Zod

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **Node.js** | Runtime |
| **Express.js** | Web Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **Socket.IO** | Real-time Communication |
| **Redis** | Caching & Online Users |
| **JWT** | Authentication |
| **bcryptjs** | Password Hashing |
| **Zod** | Validation |
| **Multer** | File Upload |
| **Morgan** | Logging |
| **Helmet** | Security Headers |

---

## ⚙️ Installation

### 1. Clone the repo
```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Fill in the `.env` file:
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/chat-app

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379

CLIENT_URL=http://localhost:3000
```

### 4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

### 🔐 Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/logout` | Private |
| GET | `/api/v1/auth/me` | Private |
| POST | `/api/v1/auth/forgot-password` | Public |
| POST | `/api/v1/auth/reset-password/:token` | Public |

### 👤 Users
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/users/profile` | Private |
| GET | `/api/v1/users/search?q=` | Private |
| GET | `/api/v1/users/:userId` | Private |
| PUT | `/api/v1/users/profile` | Private |
| PUT | `/api/v1/users/avatar` | Private |
| PUT | `/api/v1/users/password` | Private |
| PUT | `/api/v1/users/status` | Private |
| DELETE | `/api/v1/users` | Private |

### 🏠 Rooms
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/rooms` | Private |
| GET | `/api/v1/rooms/my` | Private |
| GET | `/api/v1/rooms/search?q=` | Private |
| GET | `/api/v1/rooms/:roomId` | Private |
| POST | `/api/v1/rooms` | Private |
| POST | `/api/v1/rooms/:roomId/join` | Private |
| POST | `/api/v1/rooms/:roomId/leave` | Private |
| PUT | `/api/v1/rooms/:roomId` | Admin |
| PUT | `/api/v1/rooms/:roomId/members/:userId/role` | Admin |
| DELETE | `/api/v1/rooms/:roomId` | Owner |
| DELETE | `/api/v1/rooms/:roomId/members/:userId` | Admin |

### 💬 Messages
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/messages` | Private |
| POST | `/api/v1/messages/image` | Private |
| GET | `/api/v1/messages/room/:roomId` | Private |
| PUT | `/api/v1/messages/read` | Private |
| PUT | `/api/v1/messages/:messageId` | Private |
| DELETE | `/api/v1/messages/:messageId` | Private |
| POST | `/api/v1/messages/:messageId/react` | Private |

### 📩 Conversations (DMs)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/conversations` | Private |
| POST | `/api/v1/conversations/:userId` | Private |
| GET | `/api/v1/conversations/:conversationId/messages` | Private |
| PUT | `/api/v1/conversations/:conversationId/hide` | Private |
| DELETE | `/api/v1/conversations/:conversationId` | Private |

---

## ⚡ Socket.IO Events

### Connection
```js
// Client-side connection with JWT
const socket = io("http://localhost:5000", {
  auth: { token: "your_jwt_token" }
});
```

### Messages
| Event | Direction | Description |
|---|---|---|
| `message:send` | Client → Server |  Send message |
| `message:receive` | Server → Client |  Receive message |
| `message:edit` | Client → Server |  Edit message |
| `message:edited` | Server → Room |  Edit notification |
| `message:delete` | Client → Server |  Delete message |
| `message:deleted` | Server → Room |  Delete notification |
| `message:react` | Client → Server | Add reaction |
| `message:reacted` | Server → Room | Reaction notification |
| `message:read` | Client → Server | Mark as read |
| `message:readConfirm` | Server → Client | Read confirmation ✓✓ |

### Rooms
| Event | Direction | Description |
|---|---|---|
| `room:join` | Client → Server | الانضمام لغرفة |
| `room:leave` | Client → Server | مغادرة غرفة |
| `room:userJoined` | Server → Room | إشعار انضمام يوزر |
| `room:userLeft` | Server → Room | إشعار مغادرة يوزر |

### Typing & Status
| Event | Direction | Description |
|---|---|---|
| `typing:start` | Client → Server |  Start typing |
| `typing:stop` | Client → Server |  Stop typing |
| `user:online` | Server → All |  User connected |
| `user:offline` | Server → All |  User disconnected |
| `user:status` | Client → Server |  Change user status  |
| `user:statusChanged` | Server → All |   User status changed notification  |
| `user:getOnline` | Client → Server |  Get online users   |

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `NODE_ENV` | Environment (development/production) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT secret key |
| `JWT_EXPIRES_IN` | JWT expiration time |
| `REDIS_URL` | Redis connection string |
| `CLIENT_URL` | Frontend URL for CORS |
