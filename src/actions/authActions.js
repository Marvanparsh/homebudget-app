import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  authenticateUser, 
  createUser, 
  isValidEmail, 
  isValidUsername, 
  emailExists, 
  usernameExists 
} from '../utils/authHelpers';

export async function loginAction({ request }) {
  const formData = await request.formData();
  const { identifier, password } = Object.fromEntries(formData);

  if (!identifier || !password) {
    return { error: 'Please fill in all fields' };
  }

  try {
    const user = authenticateUser(identifier, password);
    
    if (!user) {
      return { error: 'Invalid email/username or password' };
    }

    // Store current user
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.dispatchEvent(new Event('authChange'));
    
    toast.success(`Welcome back, ${user.fullName}!`);
    return redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login. Please try again.' };
  }
}

export async function signupAction({ request }) {
  const formData = await request.formData();
  const { fullName, email, username, password, confirmPassword } = Object.fromEntries(formData);

  // Validation
  if (!fullName || !email || !username || !password || !confirmPassword) {
    return { error: 'Please fill in all fields' };
  }

  if (fullName.trim().length < 2) {
    return { error: 'Full name must be at least 2 characters long' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address' };
  }

  if (!isValidUsername(username)) {
    return { error: 'Username must be at least 3 characters and contain only letters, numbers, and underscores' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  // Check if user already exists
  if (emailExists(email)) {
    return { error: 'An account with this email already exists' };
  }

  if (usernameExists(username)) {
    return { error: 'This username is already taken' };
  }

  try {
    const newUser = await createUser({
      fullName: fullName.trim(),
      email: email.trim(),
      username: username.trim(),
      password
    });

    // Don't auto-login, require email verification
    toast.success('Account created! Please check your email for verification code.');
    return redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An error occurred during registration. Please try again.' };
  }
}