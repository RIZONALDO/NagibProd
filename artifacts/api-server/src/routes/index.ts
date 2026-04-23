import { Router, type IRouter } from "express";
import healthRouter from "./health";
import teamRouter from "./team";
import equipmentRouter from "./equipment";
import shootsRouter from "./shoots";
import activityRouter from "./activity";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";
import settingsRouter from "./settings";
import calendarRouter from "./calendar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(teamRouter);
router.use(equipmentRouter);
router.use(shootsRouter);
router.use(activityRouter);
router.use(settingsRouter);
router.use(calendarRouter);

export default router;
