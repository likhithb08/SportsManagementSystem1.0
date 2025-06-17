import Player from '../models/player.js';

// Protect middleware – verifies session and attaches user to request
export const protect = async (req, res, next) => {
  try {
    console.log('Auth middleware - session:', req.session);
    console.log('Auth middleware - cookies:', req.cookies);
    
    // Check if user session exists
    if (!req.session || !req.session.user || !req.session.user._id) {
      console.log('No user session found');
      return res.status(401).json({ message: 'Not authorized, no session found' });
    }

    // Get user from database
    const user = await Player.findById(req.session.user._id);
    
    if (!user) {
      console.log('User not found in database:', req.session.user._id);
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Attach user to request
    req.user = user;
    console.log('User authenticated:', user.username, 'role:', user.role);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

// Middleware to check role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Authorization failed - no user object');
      return res.status(401).json({ message: 'Not authorized, no user' });
    }
    
    console.log('Checking role:', req.user.role, 'needed roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      console.log(`Role mismatch: user has ${req.user.role}, needs one of ${roles.join(', ')}`);
      return res.status(403).json({ 
        message: `Access denied. ${roles.join(', ')} only.` 
      });
    }
    
    console.log('Role authorized successfully');
    next();
  };
}; 