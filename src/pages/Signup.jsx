import React, { useState } from 'react';
import { Form, Link, useActionData, useNavigation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, EnvelopeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import illustration from '../assets/illustration.jpg';
import wave from '../assets/wave.svg';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="layout">
      <main>
        <div className="intro">
          <div className="signin-container">
            <h1>Sign Up</h1>
            <p>Create your account</p>
            <Form method="post" className="grid-sm">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-with-icon">
                  <IdentificationIcon className="input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <EnvelopeIcon className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <UserIcon className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    placeholder="Choose a username (3+ characters)"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <LockClosedIcon className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    required
                    placeholder="Create a password (6+ characters)"
                    autoComplete="new-password"
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <LockClosedIcon className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    minLength="6"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {actionData?.error && (
                <div className="error-message">
                  {actionData.error}
                </div>
              )}

              <input type="hidden" name="_action" value="signup" />
              
              <button type="submit" className="btn btn--dark" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </Form>
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </p>
          </div>
          <img src={illustration} alt="Person with money" width={600} height={400} />
        </div>
      </main>
      <img src={wave} alt="Decorative wave pattern" />
    </div>
  );
};

export default Signup;