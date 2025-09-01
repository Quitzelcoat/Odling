const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.signup = async (req, res) => {
  const { username, name, email, password, bio, dateOfBirth, gender } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        bio,
        dateOfBirth: new Date(dateOfBirth),
        gender,
      },

      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
      },
    });

    return res.status(201).json({ user });
  } catch (err) {
    console.log('Signup error:', err);
    if (err.code === 'P2002') {
      return res
        .status(400)
        .json({ error: 'Username or email already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
