export function notFound(req, res, next) {
  res.status(404).json({
    succes: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}
