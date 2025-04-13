const { auth } = require('../config/firebase-admin-init');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid; // Guarda el UID del usuario autenticado
    req.userRole = decoded.role || 'user'; // Asume un rol por defecto si no está definido
    next(); // Importante: continuar con el siguiente middleware/ruta
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Middleware para verificar roles de usuario
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ error: 'User role not defined' });
    }

    if (roles.length && !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    next();
  };
}

module.exports = { authenticate, authorize };