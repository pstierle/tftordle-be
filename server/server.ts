import { championGuessRouter } from "./routes/champion-guess.router";
import { frontendFolder, publicFolder, setsFolder } from "./consts";
import { traitGuessRouter } from "./routes/trait-guess.router";
import { database } from "./database/connection";
import {
  Champion,
  Trait,
  ChampionGuessChampion,
  TraitGuessChampion,
} from "./database/models/models";
import { generateRandomGuesses, importData, isDevelopment, secondsUntilMidnight } from "./util/util";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = 8080;

let clients : any = [];

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

  ChampionGuessChampion.sync();
  TraitGuessChampion.sync();

  database.sync().then(async () => {
  console.log("Database connection successfull.");
    if (doImportData) {
      await importData();
    }

    app.listen(port, (): void => {
      console.log(`Server started on port: ${port}`);
      resetGuessesIntervall();
    });
  });
} catch (error) {
  console.log("Unable to connect to the database.");
}

let timer = isDevelopment() ? 600 : secondsUntilMidnight();
const baseIntervall = isDevelopment() ? 600 : 86400;

export const resetGuessesIntervall = async () => {
    generateRandomGuesses();
    setInterval(async () => {
      timer -= 1;
      clients.forEach((client: any) => client.write(`data: ${timer}\n\n`))
      if (timer === 0) {
        timer = baseIntervall;
        await generateRandomGuesses();
      }
    }, 1000);
};


app.get('/reset-timer-event', async(req, res) =>{
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();
  res.write('retry: 10000\n\n');
  clients.push(res);
});
