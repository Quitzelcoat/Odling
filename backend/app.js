const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use(cors());

app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Odling API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});
