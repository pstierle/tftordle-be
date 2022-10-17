"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const champion_guess_router_1 = require("./routes/champion-guess.router");
const consts_1 = require("./consts");
const trait_guess_router_1 = require("./routes/trait-guess.router");
const connection_1 = require("./database/connection");
const models_1 = require("./database/models/models");
const util_1 = require("./util/util");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const events_1 = __importDefault(require("events"));
const app = (0, express_1.default)();
const port = 8080;
const Stream = new events_1.default();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.static(consts_1.publicFolder));
app.use(express_1.default.static(consts_1.frontendFolder));
app.use("/trait-guess", trait_guess_router_1.traitGuessRouter);
app.use("/champion-guess", champion_guess_router_1.championGuessRouter);
app.get("/", (req, res) => {
    res.sendFile(consts_1.frontendFolder + "/index.html");
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
    connection_1.database.authenticate();
    models_1.Trait.sync({
        force: process.env.IMPORT_DATA === "TRUE",
    });
    models_1.Champion.sync({
        force: process.env.IMPORT_DATA === "TRUE",
    });
    models_1.ChampionGuessChampion.sync();
    models_1.TraitGuessChampion.sync();
    connection_1.database.sync().then(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Database connection successfull.");
        if (process.env.IMPORT_DATA === "TRUE") {
            yield (0, util_1.importData)();
        }
        app.listen(port, () => {
            console.log(`Server started on port: ${port}`);
            (0, util_1.resetGuessesIntervall)();
        });
    }));
}
catch (error) {
    console.log("Unable to connect to the database.");
}
//# sourceMappingURL=server.js.map