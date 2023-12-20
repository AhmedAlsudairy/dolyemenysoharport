import User from '../db/models/user.js';
import { hashPassword } from './authController.js'; // Import necessary functions
import crypto from "crypto"



export const Register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await hashPassword(password);
 
    // Save the user details to the "database" (in this case, the 'users' array)
    const newUser = new User({ username, name, email, password: hashedPassword ,emailToken:crypto.randomBytes(64).toString("hex")});
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}


