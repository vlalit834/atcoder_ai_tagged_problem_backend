export const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, message: data });

export const fail = (res, data, status) =>
  res.status(status).json({ success: false, message: data });
