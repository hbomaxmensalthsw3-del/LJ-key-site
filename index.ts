import { Router, type IRouter } from "express";
import healthRouter from "./health";
import keysRouter from "./keys";
import adminRouter from "./admin";
import authRouter from "./auth";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(keysRouter);
router.use(adminRouter);
router.use(authRouter);
router.use(usersRouter);

export default router;
