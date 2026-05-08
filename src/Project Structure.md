## 📁 Project Structure

```text
chat-app/
├── config/
│   ├── database.js
│   └── redis.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── room.controller.js
│   ├── message.controller.js
│   └── conversation.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── logger.middleware.js
│   ├── ratelimit.middleware.js
│   ├── role.middleware.js
│   ├── socket.auth.middleware.js
│   ├── upload.middleware.js
│   └── validate.middleware.js
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Message.js
│   └── Conversation.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── room.routes.js
│   ├── message.routes.js
│   └── conversation.routes.js
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── room.service.js
│   ├── message.service.js
│   └── conversation.service.js
├── socket/
│   ├── index.js
│   └── handlers/
│       ├── message.handler.js
│       ├── room.handler.js
│       └── user.handler.js
├── utils/
│   ├── ApiError.js
│   ├── cache.js
│   ├── generateToken.js
│   └── sendResponse.js
├── validations/
│   ├── auth.validation.js
│   ├── user.validation.js
│   ├── room.validation.js
│   ├── message.validation.js
│   └── conversation.validation.js
├── uploads/
├── app.js
├── server.js
├── .env
├── .gitignore
└── package.json
