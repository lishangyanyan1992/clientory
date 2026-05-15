import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scansRouter from "./scans/index";
import authRouter from "./auth/index";
import businessesRouter from "./businesses/index";
import billingRouter from "./billing/index";
import promptSetsRouter from "./prompt-sets/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(scansRouter);
router.use(businessesRouter);
router.use(billingRouter);
router.use(promptSetsRouter);

export default router;
