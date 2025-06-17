// Update this path/model name if you use a unified User model

// Protect middleware – verifies token and attaches user to request
// export const protect = async (req, res, next) => {
//   let token;

//   // Assuming token is stored in a cookie named 'token'
//   if (req.cookies && req.cookies.token) {
//     token = req.cookies.token;
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token found' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await Manager.findById(decoded.id).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: 'Not authorized, user not found' });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// };

// // isManager middleware – allows only managers
// export const isManager = (req, res, next) => {
//     if (req.user && req.user.role === 'manager') {
//       return next();
//     }
//     return res.status(403).json({ message: 'Access denied. Managers only.' });
//   };
//   import jwt from 'jsonwebtoken';
// import Manager from '../models/manager.js'; 
