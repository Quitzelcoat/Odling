const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const postRoute = require('./routes/postRoute');
const { authenticate } = require('./middleware/auth');

app.use(express.json());
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
app.use('/posts', postRoute);

app.get('/', (req, res) => {
  res.send('Welcome to the Odling API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) throw error;

  console.log(`Server is running on http://localhost:${PORT}`);
});
