export function cacheControl(seconds) {
  return (req, res, next) => {
    res.set(`Cache-Control`, `public,max_age=${seconds}`);
    next();
  };
}
export function noCache(req, res, next) {
  res.set(`Cache-Control`, `no-store`);
  next();
}
