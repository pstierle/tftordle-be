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
import { resetGuessesIntervall, importData } from "./util/util";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import EventEmitter from "events";

const app = express();
const port = 8080;
const Stream = new EventEmitter();

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

app.get("/reset-timer-event", (req, res) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  Stream.on("push", (evt, data) => {
    res.write("lololol");
  });
});

app.get("/test", (req, res) => {
  Stream.emit("push");
  console.log("push");
  res.json("");
});

// app.get("/reset-guesses-timer", async (req, res) => {
//   res.json(timer);
// });

try {
  database.authenticate();
  Trait.sync({
    force: process.env.IMPORT_DATA === "TRUE",
  });
  Champion.sync({
    force: process.env.IMPORT_DATA === "TRUE",
  });

  ChampionGuessChampion.sync();
  TraitGuessChampion.sync();

  database.sync().then(async () => {
    console.log("Database connection successfull.");
    if (process.env.IMPORT_DATA === "TRUE") {
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
