import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Глобальні middleware
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Маршрут
app.use(authRoutes);
app.use(notesRoutes);

// 404 — якщо маршрут не знайдено
app.use(notFoundHandler);
// обробка помилок від celebrate (валідація)
app.use(errors());
// Error — якщо під час запиту виникла помилка
app.use(errorHandler);

await connectMongoDB();

// запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
