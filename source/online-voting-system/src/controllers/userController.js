import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class UserController {
    // Register a new user
    async register(req, res) {
        try {
            const { username, email, password, userType } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                userType,
            });

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // User login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if the user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Compare the password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign(
                { id: user._id, userType: user.userType },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    // Get user profile
    async getUserProfile(req, res) {
        try {
            const userId = req.user.id; // Assuming `req.user` is populated by an auth middleware

            const user = await User.findById(userId).select('-password'); // Exclude the password
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export default new UserController();