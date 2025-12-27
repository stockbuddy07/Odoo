import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth(), async (_, res) => {
  const [rows] = await db.query("SELECT * FROM maintenance_requests");
  res.json(rows);
});

router.post("/", auth(), async (req, res) => {
  const [[eq]] = await db.query(
    "SELECT team_id FROM equipment WHERE id=?",
    [req.body.equipment_id]
  );

  await db.query(
    `INSERT INTO maintenance_requests 
     (subject,type,equipment_id,team_id,created_by,scheduled_date)
     VALUES (?,?,?,?,?,?)`,
    [
      req.body.subject,
      req.body.type,
      req.body.equipment_id,
      eq.team_id,
      req.user.id,
      req.body.scheduled_date
    ]
  );
  res.sendStatus(201);
});

router.put("/:id/status", auth(), async (req, res) => {
  await db.query(
    "UPDATE maintenance_requests SET status=?, duration_hours=? WHERE id=?",
    [req.body.status, req.body.duration, req.params.id]
  );

  if (req.body.status === "Scrap") {
    await db.query(
      `UPDATE equipment SET is_scrapped=TRUE
       WHERE id=(SELECT equipment_id FROM maintenance_requests WHERE id=?)`,
      [req.params.id]
    );
  }

  res.sendStatus(200);
});

export default router;
