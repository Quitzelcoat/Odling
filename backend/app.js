const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

// Cloudinary config
const cloudinary = require('./config/cloudinary');

const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const followsRoute = require('./routes/followsRoute');
const notificationRoute = require('./routes/notificationRoute');
const commentsRoute = require('./routes/commentsRoute');
const { authenticate } = require('./middleware/auth');
const pictureRoute = require('./routes/pictureRoute');

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// REMOVED: No more local uploads static serving
// app.use('/uploads', express.static(UPLOAD_DIR));

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
