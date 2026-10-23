
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode < 500
      ? err.statusCode
      : 500;

  const code =
    statusCode === 500
      ? "INTERNAL_SERVER_ERROR"
      : err.code || "REQUEST_ERROR";

  const message =
    statusCode === 500
      ? "An unexpected server error occurred."
      : err.message || "The request could not be processed.";

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

module.exports = errorHandler;
