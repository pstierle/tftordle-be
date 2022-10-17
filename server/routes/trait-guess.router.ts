import { Router } from "express";
import * as traitGuessController from "../controllers/trait-guess.controller";

export const traitGuessRouter = Router();

traitGuessRouter.get("/champion", traitGuessController.getChampion);
traitGuessRouter.get("/stat-clue", traitGuessController.getStatClue);
traitGuessRouter.get("/same-trait-clue", traitGuessController.getSameTraitClue);
traitGuessRouter.get("/query-traits/:query", traitGuessController.queryTraits);
traitGuessRouter.get("/check-guess/:guess", traitGuessController.checkGuess);
