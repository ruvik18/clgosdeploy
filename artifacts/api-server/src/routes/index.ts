import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import counsellingsRouter from "./counsellings.js";
import collegesRouter from "./colleges.js";
import statsRouter from "./stats.js";
import predictRouter from "./predict.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(predictRouter);
router.use(counsellingsRouter);
router.use(collegesRouter);
router.use(statsRouter);

export default router;
