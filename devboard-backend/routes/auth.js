const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({ email, password: hashed });

        // JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
