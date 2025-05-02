// middleware/validateUser.js
module.exports = function validateUser(req, res, next) {
    const { username, password, role } = req.body;
    const errors = [];
  
    if (!username || typeof username !== "string" || !/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      errors.push("Username must be 3–20 alphanumeric characters.");
    }
  
    if (!password || typeof password !== "string" || password.length < 8 || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      errors.push("Password must be at least 8 characters and include a number and a special character.");
    }
  
    if (!["admin", "operator", "viewer"].includes(role)) {
      errors.push("Role must be one of: admin, operator, viewer.");
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
  
    next();
  };