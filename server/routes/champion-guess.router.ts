import { Router } from "express";
import * as championGuessController from "../controllers/champion-guess.controller";

export const championGuessRouter = Router();

championGuessRouter.get(
  "/query-champions/:query",
  championGuessController.queryChampions
);

championGuessRouter.get(
  "/check-guess-attr/:id/:attr",
  championGuessController.checkGuessAttr
);
