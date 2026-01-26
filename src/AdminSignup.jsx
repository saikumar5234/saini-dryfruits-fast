import React, { useState, useEffect, useRef } from 'react';
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
  Person,
  Phone,
  AdminPanelSettings,
  CheckCircle
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { API_ENDPOINTS } from './config.js';

const AdminSignup = ({ onToggleAuth, onAdminSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateSubAdminEmail = async (emailToValidate) => {
    if (!emailToValidate || !validateEmailFormat(emailToValidate)) {
      setEmailError('');
      setEmailValidated(false);
      return false;
    }

    setValidatingEmail(true);
    setEmailError('');
    setEmailValidated(false);

    try {
      const response = await fetch(API_ENDPOINTS.SUB_ADMINS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        let subAdmins = [];
        if (Array.isArray(data)) {
          subAdmins = data;
        } else if (data.subAdmins && Array.isArray(data.subAdmins)) {
          subAdmins = data.subAdmins;
        } else if (data.data && Array.isArray(data.data)) {
          subAdmins = data.data;
        }

        // Check if email exists in sub-admin list
        const emailExists = subAdmins.some(
          admin => admin.email && admin.email.toLowerCase() === emailToValidate.toLowerCase()
        );

        if (emailExists) {
          setEmailError('');
          setEmailValidated(true);
          setValidatingEmail(false);
          return true;
        } else {
          setEmailError('This email is not authorized. Please use an email provided by Super Admin.');
          setEmailValidated(false);
          setValidatingEmail(false);
          return false;
        }
      } else {
        // If API call fails, still allow signup but show warning
        setEmailError('Unable to verify email. Please ensure you are using an authorized email.');
        setEmailValidated(false);
        setValidatingEmail(false);
        return false;
      }
    } catch (err) {
      console.error('Error validating sub-admin email:', err);
      setEmailError('Unable to verify email. Please check your connection and try again.');
      setEmailValidated(false);
      setValidatingEmail(false);
      return false;
    }
  };

  const validationTimeoutRef = useRef(null);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleEmailBlur = async () => {
    if (email) {
      await validateSubAdminEmail(email);
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');
    setEmailValidated(false);
    
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    // Validate on change if email format is valid (debounced)
    if (newEmail && validateEmailFormat(newEmail)) {
      validationTimeoutRef.current = setTimeout(() => {
        validateSubAdminEmail(newEmail);
      }, 500);
    }
  };

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate email format
    if (!email || !validateEmailFormat(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate that email exists in sub-admin list
    const isEmailValid = await validateSubAdminEmail(email);
    if (!isEmailValid) {
      setError('Please use an email address that has been authorized by Super Admin.');
      setLoading(false);
      return;
    }
    
    // Validation
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
    
    if (!mobile || mobile.trim().length < 10) {
      setError('Please enter a valid mobile number');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName, 
          lastName,
          mobile: mobile.trim(),
          role: 'ADMIN'
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Admin signup request submitted successfully! Your request is pending approval.');
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setMobile('');
        
        // Call success handler if provided
        if (onAdminSignupSuccess) {
          setTimeout(() => {
            onAdminSignupSuccess(data);
          }, 2000);
        }
      } else {
        setError(data.error || 'Admin signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #f8f5f2 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 20% 80%, rgba(46, 125, 50, 0.05) 0%, transparent 50%),radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),radial-gradient(circle at 40% 40%, rgba(46, 125, 50, 0.03) 0%, transparent 50%)`, zIndex: 0 }} />
      <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', height: '100%' }}>
          <Fade in timeout={800}>
            <Card sx={{ width: '100%', maxWidth: 450, background: 'rgba(255, 255, 255, 0.98)', borderRadius: 4, boxShadow: 2, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <AdminPanelSettings sx={{ fontSize: 48, mb: 1, color: 'primary.main', filter: 'drop-shadow(0 4px 8px rgba(46,125,50,0.15))' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', letterSpacing: '-0.5px' }}>Sub-Admin Signup</Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 400, letterSpacing: '0.3px', lineHeight: 1.3, color: 'text.secondary' }}>Sign up using the email provided by Super Admin</Typography>
              </Box>
              <form onSubmit={handleAdminSignup} style={{ width: '100%', maxWidth: 380 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main', textAlign: 'center' }}>Sub-Admin Registration</Typography>
                <Grow in={!!error}><div>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}</div></Grow>
                <Grow in={!!success}><div>{success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}</div></Grow>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Please use the email address provided by your Super Admin to complete registration.
                  </Typography>
                </Alert>
                <TextField 
                  label="Email (Provided by Super Admin)" 
                  type="email" 
                  value={email} 
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  fullWidth 
                  required 
                  margin="normal" 
                  error={!!emailError}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                    endAdornment: validatingEmail ? (
                      <InputAdornment position="end">
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                          <CircularProgress size={20} />
                        </Box>
                      </InputAdornment>
                    ) : emailValidated ? (
                      <InputAdornment position="end">
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, color: 'success.main' }}>
                          <CheckCircle fontSize="small" />
                        </Box>
                      </InputAdornment>
                    ) : null
                  }} 
                  helperText={emailError || (emailValidated ? 'Email verified ✓' : 'Enter the email provided by Super Admin')} 
                />
                <TextField label="First Name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
                <TextField label="Last Name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Person /></InputAdornment>) }} />
                <TextField label="Mobile Number" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }} />
                <TextField label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={handleTogglePasswordVisibility} onMouseDown={e => e.preventDefault()} edge="end" tabIndex={0}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                <TextField label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} fullWidth required margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton aria-label="toggle confirm password visibility" onClick={handleToggleConfirmPasswordVisibility} onMouseDown={e => e.preventDefault()} edge="end" tabIndex={0}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 2, mb: 1, fontWeight: 'bold', borderRadius: 3 }} disabled={loading}>{loading ? <Fade in={loading}><PersonAdd sx={{ animation: 'spin 1s linear infinite' }} /></Fade> : 'Submit Admin Request'}</Button>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                  Already have an account?{' '}
                  <Button variant="text" color="secondary" onClick={onToggleAuth} sx={{ fontWeight: 'bold', textTransform: 'none', p: 0 }} tabIndex={0}>
                    Sign In
                  </Button>
                </Typography>
                <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'text.secondary', fontStyle: 'italic' }}>
                  After registration, you can login with this email and your password.
                </Typography>
              </form>
            </Card>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminSignup;

