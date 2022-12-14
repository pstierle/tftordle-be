import { championGuessRouter } from "./routes/champion-guess.router";
import { publicFolder, frontendDevUrl, frontendProdUrl } from "./consts";
import { traitGuessRouter } from "./routes/trait-guess.router";
import { database } from "./database/connection";
import {
  Champion,
  ChampionGuessChampion,
  Trait,
  TraitGuessChampion,
} from "./database/models/models";
import {
  generateGuessChampions,
  importData,
  secondsUntilMidnight,
} from "./util/util";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = 8080;

dotenv.config();

app.use(
  cors({
    origin: process.env.NODE_ENV === "DEV" ? frontendDevUrl : frontendProdUrl,
  })
);
app.use(express.static(publicFolder));

app.use("/trait-guess", traitGuessRouter);
app.use("/champion-guess", championGuessRouter);

try {
  const doImportData = process.env.IMPORT_DATA === "TRUE";

  database.authenticate();

  Trait.sync({
    force: doImportData,
  });
  Champion.sync({
    force: doImportData,
  });

  database.sync().then(async () => {
    console.log("Database connection successfull!");
    if (doImportData) {
      await importData();
    }

    app.listen(port, (): void => {
      console.log(`Server started on port: ${port}`);
    });
  });
} catch (error) {
  console.log("Unable to connect to the database.");
}

app.get("/reset-timer", async (req, res) => {
  res.json(secondsUntilMidnight());
});

app.get("/riot.txt", async (req, res) => {
  res.sendFile("riot.txt");
});

app.get("//riot.txt", async (req, res) => {
  res.sendFile("riot.txt");
});
