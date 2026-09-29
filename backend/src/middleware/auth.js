const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");

async function requireAuth(req, res, next) {
  const authorization = req.get("authorization");
  const token = authorization && authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: "User no longer exists" });
    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email before accessing your account", isUnverified: true });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
