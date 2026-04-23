import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamRouter from "./team";
import equipmentRouter from "./equipment";
import shootsRouter from "./shoots";
import activityRouter from "./activity";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(teamRouter);
router.use(equipmentRouter);
router.use(shootsRouter);
router.use(activityRouter);

export default router;
