import express from "express";
import {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
} from "../controllers/recurringController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);

r.get("/", getRecurring);
r.post("/", createRecurring);
r.put("/:id", updateRecurring);
r.delete("/:id", deleteRecurring);

export default r;
