// Authentication middleware
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
      code: "AUTH_REQUIRED",
    });
  }

  // Add user info to request object for easy access
  req.user = req.session.user;
  next();
};

// Optional authentication middleware (for routes that can work with or without auth)
export const optionalAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.user) {
    req.user = req.session.user;
  }
  next();
};

// Role-based access control (for future use)
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions.",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }
    next();
  };
};

// Admin access control
export const requireAdmin = requireRole("admin");

// User can only access their own resources
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId =
        req.params.id || req.params.taskId || req.params.userId;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID is required.",
          code: "MISSING_RESOURCE_ID",
        });
      }

      // For now, we'll implement basic ownership check
      // In a real app, you'd query the database to verify ownership
      if (resourceType === "task") {
        // Tasks should belong to the authenticated user
        // This will be implemented in the task controller
        next();
      } else if (resourceType === "user") {
        // Users can only access their own profile
        if (req.user.id !== resourceId) {
          return res.status(403).json({
            success: false,
            message: "You can only access your own profile.",
            code: "ACCESS_DENIED",
          });
        }
        next();
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
};
