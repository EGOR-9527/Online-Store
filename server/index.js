require("dotenv").config();

const express = require("express");
const http = require("http");
const router = require("./router/index");
const sequelize = require("./db");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

// Настройка CORS
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL,
}));

const sessionOptions = {
  secret: "ZOV_RUSSIA_ZOV",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Убедитесь, что secure: true, если используете HTTPS
};

app.use(session(sessionOptions));

// Middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api", router);

const server = http.createServer(app);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    server.listen(PORT, () => {
      console.log("Сервер запущен на порту: " + PORT);
    });
  } catch (err) {
    console.error("Ошибка при подключении к БД:", err);
  }
};

start();