import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  Slide,
  Fade,
  Grow
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Store,
  Login as LoginIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from './config.js';

const Login = ({ onToggleAuth, onLoginSuccess, onForgotPassword, onShowAdminSignup, onShowAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data));
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', letterSpacing: '-0.5px' }}>Welcome Back</Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 400, letterSpacing: '0.3px', lineHeight: 1.3, color: 'text.secondary' }}>Sign in to your account</Typography>
              </Box>
              <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 340 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main', textAlign: 'center' }}>Sign In</Typography>
                <Grow in={!!error}><div>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}</div></Grow>
                <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>) }} />
                <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={handleTogglePasswordVisibility} onMouseDown={e => e.preventDefault()} edge="end" tabIndex={0}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2, mb: 1, fontWeight: 'bold', borderRadius: 3 }} disabled={loading}>{loading ? <Fade in={loading}><LoginIcon sx={{ animation: 'spin 1s linear infinite' }} /></Fade> : 'Sign In'}</Button>
                {onForgotPassword && (
                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Button 
                      variant="text" 
                      color="secondary" 
                      onClick={onForgotPassword} 
                      sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '0.875rem' }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                  Don't have an account?{' '}
                  <Button variant="text" color="secondary" onClick={onToggleAuth} sx={{ fontWeight: 'bold', textTransform: 'none', p: 0 }} tabIndex={0}>
                    Sign Up
                  </Button>
                </Typography>
                {onShowAdminLogin && (
                  <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                    Admin?{' '}
                    <Button variant="text" color="primary" onClick={onShowAdminLogin} sx={{ fontWeight: 'bold', textTransform: 'none', p: 0 }} tabIndex={0}>
                      Admin Login
                    </Button>
                  </Typography>
                )}
                {onShowAdminSignup && (
                  <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    Need admin access?{' '}
                    <Button variant="text" color="primary" onClick={onShowAdminSignup} sx={{ fontWeight: 'bold', textTransform: 'none', p: 0 }} tabIndex={0}>
                      Admin Signup
                    </Button>
                  </Typography>
                )}
              </form>
            </Card>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 