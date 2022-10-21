import { championGuessRouter } from "./routes/champion-guess.router";
import { frontendFolder, publicFolder } from "./consts";
import { traitGuessRouter } from "./routes/trait-guess.router";
import { database } from "./database/connection";
import {
  Champion,
  Trait,
  ChampionGuessChampion,
  TraitGuessChampion,
} from "./database/models/models";
import {
  generateRandomGuesses,
  importData,
  secondsUntilMidnight,
} from "./util/util";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = 8080;

let clients: any = [];

dotenv.config();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static(publicFolder));
app.use(express.static(frontendFolder));

app.use("/trait-guess", traitGuessRouter);
app.use("/champion-guess", championGuessRouter);

app.get("/", (req, res) => {
  res.sendFile(frontendFolder + "/index.html");
});

try {
  const doImportData = process.env.IMPORT_DATA === "TRUE";

  database.authenticate();

  Trait.sync({
    force: doImportData,
  });
  Champion.sync({
    force: doImportData,
  });
  ChampionGuessChampion.sync({
    force: doImportData,
  });
  TraitGuessChampion.sync({
    force: doImportData,
  });

  database.sync().then(async () => {
    console.log("Database connection successfull!");
    if (doImportData) {
      await importData();
    }

    await resetGuessesTimer();

    app.listen(port, (): void => {
      console.log(`Server started on port: ${port}`);
    });
  });
} catch (error) {
  console.log("Unable to connect to the database.");
}

export const resetGuessesTimer = async () => {
  await generateRandomGuesses();
  setTimeout(async () => {
    await resetGuessesTimer();
  }, secondsUntilMidnight() * 1000);
};

app.get("/reset-timer", async (req, res) => {
  res.json(secondsUntilMidnight());
});

app.get("/riot.txt", async (req, res) => {
  res.sendFile("riot.txt");
});

app.get("//riot.txt", async (req, res) => {
  res.sendFile("riot.txt");
});
