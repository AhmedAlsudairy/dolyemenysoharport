import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../db/models/user.js'; // Import your User model
import { comparePassword, generateToken } from './authController.js';


const secretKey = process.env.SECRET_KEY;
export const Login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username exists in the database
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await comparePassword(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // If username and password are correct, generate a JWT token
      const token = generateToken(user._id);
  
      // Send the token in the response
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  };