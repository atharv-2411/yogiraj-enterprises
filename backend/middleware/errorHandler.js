const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[ErrorHandler] ${err.name}: ${err.message}`);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, error: error.message });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error.message = `Duplicate value for '${field}'. Please use a different value.`;
    return res.status(400).json({ success: false, error: error.message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error.message = messages.join(". ");
    return res.status(400).json({ success: false, error: error.message });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Invalid token." });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Token has expired." });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
