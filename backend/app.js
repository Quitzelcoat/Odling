const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

const authRoute = require('./routes/authRoute');
const { authenticate } = require('./middleware/auth');

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get('/', authenticate, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

app.use('/auth', authRoute);

app.get('/', (req, res) => {
  res.send('Welcome to the Odling API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) throw error;

  console.log(`Server is running on http://localhost:${PORT}`);
});
