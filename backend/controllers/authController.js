const express = require('express');
router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

exports.signUp = async (req, res) => {
  const { username, email, password, name, bio, dateOfBirth, gender } =
    req.body;
  if (!username || !name || !email || !password) {
    return res
      .status(4004)
      .json({ error: 'Username, name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        bio: bio || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
      },
      select: { id: true, username: true, email: true, name: true },
    });

    return res.status(201).json({ message: 'User created', user });
  } catch (err) {
    if (err.code === 'P2002') {
      const target = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({ error: `${target} already in use` });
    }
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res
      .status(400)
      .json({ error: 'Email/Username and password are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    console.log('JWT token for user', user.id, token);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (() => {
        const exp = process.env.JWT_EXPIRES_IN || '1h';
        return 1000 * 60 * 60;
      })(),
    });

    return res.json({ message: 'Login successful', token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.json({ message: 'Logout successful' });
};

exports.getMe = async (req, res) => {
  try {
    // authenticate middleware already ensured req.user exists with id
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        bio: true,
        profilePic: true,
      },
    });

    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: fullUser });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
