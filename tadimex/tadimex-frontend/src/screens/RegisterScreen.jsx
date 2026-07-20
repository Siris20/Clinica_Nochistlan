import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Grid, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { UseRegisterValidation } from '../hooks/UseRegisterValidation';
import { Header } from '../partials/Header';

export const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, success, errors } = UseRegisterValidation();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(username, password);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Header showNavBarContent={false} />
      <Container component="main" maxWidth="sm">
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
          <Grid item>
            <Paper elevation={3} sx={{ padding: 6, borderRadius: 2 }}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <img src="images/tadimex.png" alt="Logo Tadimex" style={{ width: '150px', marginBottom: 20 }} />
                </Box>

                <Typography component="h1" variant="h5" sx={{ textAlign: 'center', mb: 4 }}>
                  Registro de usuario
                </Typography>

                <TextField
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Nombre de usuario"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 3 }}
                  error={!!errors.username}
                  helperText={errors.username}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 3 }}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </Button>
                {error && <Typography color="error">Error: {error.msg}</Typography>}
                {success && <Typography color="success">Usuario registrado exitosamente</Typography>}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};