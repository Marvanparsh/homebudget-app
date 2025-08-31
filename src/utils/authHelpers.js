import { fetchData } from '../helpers';

// Hash password (simple implementation - in production use bcrypt)
export const hashPassword = (password) => {
  return btoa(password + 'salt123'); // Simple base64 encoding with salt
};

// Validate email format
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate username format
export const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

// Check if user exists by email or username
export const findUserByEmailOrUsername = (identifier) => {
  if (!identifier || typeof identifier !== 'string') return null;
  const users = fetchData('users') || [];
  return users.find(user => 
    user.email.toLowerCase() === identifier.toLowerCase() || 
    user.username.toLowerCase() === identifier.toLowerCase()
  );
};

// Check if email already exists
export const emailExists = (email) => {
  const users = fetchData('users') || [];
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Check if username already exists
export const usernameExists = (username) => {
  const users = fetchData('users') || [];
  return users.some(user => user.username.toLowerCase() === username.toLowerCase());
};

// Create new user
export const createUser = ({ email, username, password, fullName }) => {
  const users = fetchData('users') || [];
  const newUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    fullName,
    password: hashPassword(password),
    createdAt: Date.now(),
    lastLogin: null
  };
  
  const updatedUsers = [...users, newUser];
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Authenticate user
export const authenticateUser = (identifier, password) => {
  const user = findUserByEmailOrUsername(identifier);
  if (!user) return null;
  
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) return null;
  
  // Update last login
  const users = fetchData('users') || [];
  const updatedUsers = users.map(u => 
    u.id === user.id ? { ...u, lastLogin: Date.now() } : u
  );
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, lastLogin: Date.now() };
};

// Get user data by ID
export const getUserById = (userId) => {
  const users = fetchData('users') || [];
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};