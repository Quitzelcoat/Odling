const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const followsRoute = require('./routes/followsRoute');
const notificationRoute = require('./routes/notificationRoute');
const commentsRoute = require('./routes/commentsRoute');
const { authenticate } = require('./middleware/auth');
const pictureRoute = require('./routes/pictureRoute');

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/uploads', express.static(UPLOAD_DIR));

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
