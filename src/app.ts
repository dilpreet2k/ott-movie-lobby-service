import routes from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import { authenticateToken } from './middlewares/authHandler';

import mongoose from 'mongoose';
import express from 'express';
import nodeCache from 'node-cache';

import dotenv from 'dotenv';
dotenv.config();

// Access environment variables
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/';
const DB_NAME = process.env.DB_NAME || 'movie_lobby';
const PORT = process.env.PORT || 3001;

const app = express();

// DB connection + Cache
mongoose.connect(MONGO_URL + DB_NAME);

// Caching...
const cache = new nodeCache();
app.use((req, res, next) => {
    const cached = cache.get(req.originalUrl || req.url);
    if (cached) {
        return res.json(cached);
    }

    next();
});

// Middleware related
app.use(express.json());
app.use((req, res, next) => authenticateToken(req, res, next));

// Routes
app.use('/movie_lobby', routes);

// Middleware related
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is up on http://localhost:${PORT} !!!`);
});
