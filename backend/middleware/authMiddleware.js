const jwt = require("jsonwebtoken");
const Config = require("../config");

exports.authMiddleware = (req, res, next) => {
    let token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, Config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

exports.verifyAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Access denied. Admins only." });
  } catch (err) {
    return res.status(400).json({ error: "Invalid token" });
  }
};

exports.verifyUser = (req, res, next) => {
  try {
    if (req.user && req.user.role === "user") {
      return next();
    }
    return res.status(403).json({ message: "Access denied. Users only." });
  } catch (err) {
    return res.status(400).json({ error: "Invalid token" });
  }
};
