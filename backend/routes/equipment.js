import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth(), async (_, res) => {
  const [rows] = await db.query("SELECT * FROM equipment");
  res.json(rows);
});

router.get("/:id/requests", auth(), async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM maintenance_requests WHERE equipment_id=?",
    [req.params.id]
  );
  res.json(rows);
});

export default router;
