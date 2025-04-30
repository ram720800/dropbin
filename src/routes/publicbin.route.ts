import { Router } from "express";
import { getPublicBin } from "../controllers/publicbin.controller";
const publicBinRouter = Router();

publicBinRouter.get('/:id', getPublicBin);

export default publicBinRouter;