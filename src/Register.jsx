import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Card,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Slide,
  Fade,
  Grow
} from '@mui/material';
import {
  Store,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Person
} from '@mui/icons-material';
import { API_ENDPOINTS } from './config.js';

const Register = ({ onToggleAuth, onRegisterSuccess, onShowOTP }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const DEFAULT_MOBILE = '9000022066';

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName, 
          lastName,
          mobile: DEFAULT_MOBILE
        })
      });
      const data = await res.json();
      if (data.success) {
        // Show OTP verification instead of directly logging in
        if (onShowOTP) {
          onShowOTP({
            userId: data.userId,
            mobile: DEFAULT_MOBILE,
            userData: data
          });
        } else {
          // Fallback: if OTP handler not provided, proceed with login
          localStorage.setItem('currentUser', JSON.stringify(data));
          onRegisterSuccess(data);
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #f8f5f2 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 20% 80%, rgba(46, 125, 50, 0.05) 0%, transparent 50%),radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),radial-gradient(circle at 40% 40%, rgba(46, 125, 50, 0.03) 0%, transparent 50%)`, zIndex: 0 }} />
      <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', height: '100%' }}>
          <Fade in timeout={800}>
            <Card sx={{ width: '100%', maxWidth: 400, background: 'rgba(255, 255, 255, 0.98)', borderRadius: 4, boxShadow: 2, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Store sx={{ fontSize: 48, mb: 1, color: 'primary.main', filter: 'drop-shadow(0 4px 8px rgba(46,125,50,0.15))' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', letterSpacing: '-0.5px' }}>Create Account</Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 400, letterSpacing: '0.3px', lineHeight: 1.3, color: 'text.secondary' }}>Register to get started</Typography>
              </Box>
              <form onSubmit={handleRegister} style={{ width: '100%', maxWidth: 340 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main', textAlign: 'center' }}>Sign Up</Typography>
                <Grow in={!!error}><div>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}</div></Grow>
                <TextField label="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
                <TextField label="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
                <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>) }} />
                <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={handleTogglePasswordVisibility} onMouseDown={e => e.preventDefault()} edge="end" tabIndex={0}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                <TextField label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle confirm password visibility" onClick={handleToggleConfirmPasswordVisibility} onMouseDown={e => e.preventDefault()} edge="end" tabIndex={0}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2, mb: 1, fontWeight: 'bold', borderRadius: 3 }} disabled={loading}>{loading ? <Fade in={loading}><PersonAdd sx={{ animation: 'spin 1s linear infinite' }} /></Fade> : 'Sign Up'}</Button>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Already have an account?{' '}
                  <Button variant="text" color="secondary" onClick={onToggleAuth} sx={{ fontWeight: 'bold', textTransform: 'none', p: 0 }} tabIndex={0}>
                    Sign In
                  </Button>
                </Typography>
              </form>
            </Card>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default Register; 