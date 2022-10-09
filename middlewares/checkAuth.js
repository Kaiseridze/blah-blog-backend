import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  if (token) {
    try {
      const decoded = jwt.verify(token, "mambers");
      req.userId = decoded._id;
      next();
    } catch (err) {
      res.status(500).json({
        message: "Не удалось расшифровать ключ",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа",
    });
  }
};
