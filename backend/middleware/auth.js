// middleware/auth.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // move to .env later

// Middleware: Require valid login token
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing or invalid token" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalid or expired" });
  }
}

// Middleware: Check role
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

function socketAuthMiddleware (socket, next){
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication token is missing"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user; // attach decoded user to socket object
    next(); // allow connection
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }
};


module.exports = { requireAuth, requireRole, socketAuthMiddleware };
