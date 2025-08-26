const dataManager = require("../utils/dataManager");

// Middleware to check if user is authenticated
const requireAuthentication = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  // Verify user still exists in database
  const currentUser = dataManager.findUserById(req.session.userId);
  if (!currentUser) {
    // Clear invalid session
    req.session.destroy();
    return res.status(401).json({
      success: false,
      message: "User session invalid. Please log in again.",
    });
  }

  // Add user info to request object
  req.currentUser = currentUser;
  next();
};

// Middleware to check if user is not authenticated (for login/signup pages)
const requireNoAuthentication = (req, res, next) => {
  if (req.session.userId) {
    return res.status(400).json({
      success: false,
      message: "You are already logged in.",
    });
  }
  next();
};

module.exports = {
  requireAuthentication,
  requireNoAuthentication,
};
