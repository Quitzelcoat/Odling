import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import 'dotenv/config';

// Cloudinary config
import cloudinary from './config/cloudinary.js';

import authRoute from './routes/authRoute.js';
import profileRoute from './routes/profileRoute.js';
import userRoute from './routes/userRoute.js';
import postRoute from './routes/postRoute.js';
import followsRoute from './routes/followsRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import commentsRoute from './routes/commentsRoute.js';
import { authenticate } from './middleware/auth.js';
import pictureRoute from './routes/pictureRoute.js';

app.use(json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.get('/', authenticate, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

app.use('/auth', authRoute);
app.use('/profile', profileRoute);
app.use('/users', userRoute);
app.use('/posts', postRoute);
app.use('/comments', commentsRoute);
app.use('/follows', followsRoute);
app.use('/notifications', notificationRoute);
app.use('/pictures', pictureRoute);

app.get('/', (req, res) => {
  res.send('Welcome to the Odling API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Server is running on http://localhost:${PORT}`);
});
