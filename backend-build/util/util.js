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
exports.importData = exports.championWithImagePath = exports.traitWithImagePath = exports.generateRandomGuesses = exports.isDevelopment = exports.secondsUntilMidnight = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../database/models/models");
const connection_1 = require("../database/connection");
const consts_1 = require("../consts");
const promises_1 = __importDefault(require("fs/promises"));
const secondsUntilMidnight = () => {
    var midnight = new Date();
    midnight.setHours(24);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    return (midnight.getTime() - new Date().getTime()) / 1000;
};
exports.secondsUntilMidnight = secondsUntilMidnight;
const isDevelopment = () => {
    return process.env.NODE_ENV === "DEV";
};
exports.isDevelopment = isDevelopment;
const generateRandomGuesses = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date().toLocaleDateString();
    const championGuessChampion = yield models_1.ChampionGuessChampion.findOne({
        where: {
            created: today,
        },
    });
    const traitGuessChampion = yield models_1.TraitGuessChampion.findOne({
        where: {
            created: today,
        },
    });
    if (!championGuessChampion && !traitGuessChampion) {
        yield connection_1.database
            .query("SELECT * FROM `Champions` ORDER BY random() LIMIT 2", {
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
        })
            .then((champions) => {
            if (champions.length === 0)
                return;
            models_1.ChampionGuessChampion.create({
                name: champions[0].name,
                set: champions[0].set,
                created: today,
            });
            models_1.TraitGuessChampion.create({
                name: champions[1].name,
                set: champions[1].set,
                created: today,
            });
        });
    }
});
exports.generateRandomGuesses = generateRandomGuesses;
const getChampionImagePath = (name, set) => {
    const isDevelopment = process.env.NODE_ENV === "DEV";
    const hostUrl = isDevelopment ? consts_1.devUrl : consts_1.prodUrl;
    return `${hostUrl}/sets/${set}/champions/${name
        .toLowerCase()
        .replace("'", "")
        .replace("&", "")
        .replace(" ", "")
        .replace(" ", "")}.png`;
};
const getTraitImagePath = (label) => {
    const isDevelopment = process.env.NODE_ENV === "DEV";
    const hostUrl = isDevelopment ? consts_1.devUrl : consts_1.prodUrl;
    return `${hostUrl}/sets/traits/${label
        .toLowerCase()
        .replace("-", "")
        .replace(" ", "")}.png`;
};
const traitWithImagePath = (trait) => {
    return Object.assign(Object.assign({}, trait), { imagePath: getTraitImagePath(trait.label) });
};
exports.traitWithImagePath = traitWithImagePath;
const championWithImagePath = (champion) => {
    return Object.assign(Object.assign({}, champion), { imagePath: getChampionImagePath(champion.name, champion.set.toString().charAt(0)) });
};
exports.championWithImagePath = championWithImagePath;
const importData = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Importing Data.");
    yield Promise.all(consts_1.sets.map((set) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield promises_1.default.readFile(consts_1.publicFolder + `/sets/${set}/champions.json`, "utf-8");
        const champions = JSON.parse(data);
        yield Promise.all(champions.map((champion) => __awaiter(void 0, void 0, void 0, function* () {
            const parsedChampion = {
                name: champion.name,
                set: champion.set,
                cost: champion.cost,
                range: champion.range,
            };
            yield models_1.Champion.create(Object.assign({}, parsedChampion)).then((c) => __awaiter(void 0, void 0, void 0, function* () {
                yield Promise.all(champion.traits.map((trait) => __awaiter(void 0, void 0, void 0, function* () {
                    const parsedLabel = trait
                        .replace("_", "")
                        .replace(/[0-9]/g, "")
                        .replace("Set", "");
                    const parsedTrait = {
                        label: parsedLabel,
                        set: Number(set),
                        champion_id: c.id,
                    };
                    yield models_1.Trait.create(Object.assign({}, parsedTrait));
                })));
            }));
        })));
    })));
});
exports.importData = importData;
//# sourceMappingURL=util.js.map