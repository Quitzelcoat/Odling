// controllers/authController.js
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

exports.signUp = async (req, res) => {
  const { username, email, password, name, bio, dateOfBirth, gender } =
    req.body;
  if (!username || !name || !email || !password) {
    return res
      .status(400)
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
    console.error('signUp error:', err);
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

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN,
      }
    );

    console.log('JWT token for user', user.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (() => {
        if (process.env.JWT_EXPIRES_IN) {
          return 24 * 60 * 60 * 1000;
        }
        return 1000 * 60 * 60;
      })(),
    });

    return res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('login error:', err);
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

exports.guestLogin = async (req, res) => {
  try {
    const rand = crypto.randomBytes(4).toString('hex');
    const short = `${Date.now().toString(36)}${rand}`;
    const username = `guest_${short}`.slice(0, 30);
    const email = `guest+${short}@example.local`;

    const rawPassword = crypto.randomBytes(12).toString('hex');
    const hashed = await bcrypt.hash(rawPassword, SALT_ROUNDS);

    const name = 'Guest User';

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashed,
      },
      select: {
        id: true,
        username: true,
        name: true,
        profilePic: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || JWT_EXPIRES_IN,
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({ token, user });
  } catch (err) {
    console.error('guestLogin error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
