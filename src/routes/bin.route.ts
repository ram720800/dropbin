import { Router } from "express";
import {
  createBin,
  getBin,
  getAllBins,
  deleteBin,
  shareBin,
} from "../controllers/bin.controller";
const binRouter = Router();

binRouter.post("/", createBin);
binRouter.get("/:id", getBin);
binRouter.get("/", getAllBins);
binRouter.delete("/:id", deleteBin);
binRouter.patch("/:id/share", shareBin);

export default binRouter;
