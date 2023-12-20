import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const secretKey = process.env.SECRET_KEY;



const generateToken = (userId) => {
  const token = jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' }); // Change 'your_secret_key' to your own secret key
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey); // Change 'your_secret_key' to your own secret key
    return decoded;
  } catch (err) {
    return null;
  }
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};

export { generateToken, verifyToken, hashPassword, comparePassword };
