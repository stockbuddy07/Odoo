import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.*, r.name role FROM users u JOIN roles r ON r.id=u.role_id WHERE email=?`,
    [req.body.email]
  );

  if (!rows.length) return res.sendStatus(401);

  const token = jwt.sign(
    { id: rows[0].id, role: rows[0].role },
    "SECRET"
  );
  res.json({ token });
});

export default router;
