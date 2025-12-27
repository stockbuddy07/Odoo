import jwt from "jsonwebtoken";

export const auth = (roles = []) => (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const user = jwt.verify(token, "SECRET");
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
