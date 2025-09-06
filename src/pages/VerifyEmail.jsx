import React, { useState, useEffect } from 'react';
import { Form, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchData } from '../helpers';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const email = searchParams.get('email');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const users = fetchData('users') || [];
      const user = users.find(u => u.email === email && u.verificationCode === code.toUpperCase());
      
      if (!user) {
        toast.error('Invalid verification code');
        return;
      }

      // Mark email as verified
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, emailVerified: true, verificationCode: null } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Login user
      const { password: _, ...userWithoutPassword } = { ...user, emailVerified: true };
      login(userWithoutPassword);
      
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <main>
        <div className="intro">
          <div className="signin-container">
            <h1>Verify Email</h1>
            <p>Enter the 6-digit verification code sent to:</p>
            <p><strong>{email}</strong></p>
            <p><small>Check your email inbox and spam folder</small></p>
            
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn--dark" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;