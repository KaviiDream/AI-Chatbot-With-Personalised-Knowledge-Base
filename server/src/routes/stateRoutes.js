import { Router } from "express";
import { getState, updatePlanner, updateTools } from "../controllers/stateController.js";

const router = Router();

router.get("/:userId", getState);
router.put("/:userId/planner", updatePlanner);
router.put("/:userId/tools", updateTools);

export default router;
