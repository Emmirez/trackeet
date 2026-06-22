import express from "express";
import {
  getTeam,
  inviteMember,
  acceptInvite,
  updateMember,
  removeMember,
  getMyTeamContext,
} from "../controllers/teamController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);

r.get("/", getTeam);
r.post("/invite", inviteMember);
r.post("/accept", acceptInvite);
r.get("/context", getMyTeamContext);
r.put("/:id", updateMember);
r.delete("/:id", removeMember);

export default r;
