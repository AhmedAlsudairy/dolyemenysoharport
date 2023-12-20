import User from "../db/models/user.js";


export const users= async (req, res) => {
    try {
      // Fetch all users from the database using the User model
      const users = await User.find({}, '-password'); // Excluding the password field from the response
  
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  
