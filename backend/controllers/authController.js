import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token lasts for 7 days
  });
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate standard profile picture using open dicebear avatars api
    const profilePic = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      token,
    });
  } catch (error) {
    console.error(`Error in signup controller: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error during signup' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // We explicitly select the password because by default it is excluded
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token,
    });
  } catch (error) {
    console.error(`Error in login controller: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is populated by the protectRoute middleware
    return res.status(200).json(req.user);
  } catch (error) {
    console.error(`Error in getMe controller: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error fetching profile' });
  }
};
