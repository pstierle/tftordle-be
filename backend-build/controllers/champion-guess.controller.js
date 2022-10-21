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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGuessAttr = exports.queryChampions = void 0;
const models_1 = require("./../database/models/models");
const util_1 = require("../util/util");
const sequelize_1 = require("sequelize");
const getGuessChampion = () => __awaiter(void 0, void 0, void 0, function* () {
    const guessChampion = yield models_1.ChampionGuessChampion.findAll({
        order: [["created", "DESC"]],
        limit: 1,
        raw: true,
    });
    const champion = yield models_1.Champion.findOne({
        raw: true,
        where: {
            name: guessChampion[0].name,
            set: guessChampion[0].set,
        },
    });
    console.log("Championguess Champion: ", champion);
    return champion;
});
const queryChampions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const champions = yield models_1.Champion.findAll({
        raw: true,
        where: { name: { [sequelize_1.Op.like]: `%${req.params.query}%` } },
        order: [["name", "ASC"]],
    });
    const results = champions
        .filter((champion) => champion.name.toLowerCase()[0] === req.params.query.toLowerCase()[0])
        .slice(0, 10);
    res.json(results
        .map((champion) => {
        const withImagePath = (0, util_1.championWithImagePath)(champion);
        return {
            id: withImagePath.id,
            name: withImagePath.name,
            set: withImagePath.set,
            cost: withImagePath.cost,
            imagePath: withImagePath.imagePath,
            range: withImagePath.range,
        };
    })
        .sort((a, b) => {
        if (a.set < b.set) {
            return -1;
        }
        if (a.set > b.set) {
            return 1;
        }
        return 0;
    }));
});
exports.queryChampions = queryChampions;
const checkGuessAttr = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attrs = ["set", "cost", "range", "traits"];
    let results = [];
    const guessChampion = yield getGuessChampion();
    const userGuessChampion = yield models_1.Champion.findByPk(req.params.id, {
        raw: true,
    });
    yield Promise.all(attrs.map((attr) => __awaiter(void 0, void 0, void 0, function* () {
        const searchValue = guessChampion[attr];
        let userGuessValue = userGuessChampion[attr];
        let result = {
            attrLabel: attr,
            matchState: "wrong",
            userGuessValue: userGuessValue,
        };
        if (attr === "traits") {
            const guessChampionTraits = yield models_1.Trait.findAll({
                raw: true,
                where: {
                    champion_id: guessChampion.id,
                },
            });
            const userGuessChampionTraits = yield models_1.Trait.findAll({
                raw: true,
                where: {
                    champion_id: userGuessChampion.id,
                },
            });
            guessChampionTraits
                .map((t) => t.label)
                .forEach((trait) => {
                if (userGuessChampionTraits.map((t) => t.label).includes(trait))
                    result.matchState = "some";
            });
            if (JSON.stringify(guessChampionTraits) ===
                JSON.stringify(userGuessChampionTraits)) {
                result.matchState = "exact";
            }
            result.userGuessValue = userGuessChampionTraits.map((t) => t.label);
        }
        else {
            if (userGuessValue === searchValue) {
                result.matchState = "exact";
            }
            if (userGuessValue > searchValue) {
                result.matchState = "lower";
            }
            if (userGuessValue < searchValue) {
                result.matchState = "higher";
            }
        }
        results.push(result);
    })));
    res.json(results);
});
exports.checkGuessAttr = checkGuessAttr;
//# sourceMappingURL=champion-guess.controller.js.map