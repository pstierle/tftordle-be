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
exports.getSameTraitClue = exports.queryTraits = exports.getStatClue = exports.checkGuess = exports.getChampion = void 0;
const models_1 = require("./../database/models/models");
const util_1 = require("../util/util");
const sequelize_1 = require("sequelize");
const getTraitGuessChampion = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = (0, util_1.changeTimeZone)(new Date(), "Europe/Berlin").toLocaleDateString();
    console.log(today);
    models_1.TraitGuessChampion.findAll({ raw: true }).then((c) => console.log(c));
    const traitGuessChampion = yield models_1.TraitGuessChampion.findAll({
        where: {
            created: today,
        },
        raw: true,
    });
    console.log(traitGuessChampion);
    const champion = yield models_1.Champion.findOne({
        raw: true,
        where: {
            name: traitGuessChampion[0].name,
            set: traitGuessChampion[0].set,
        },
    });
    console.log("Traitguess Champion: ", champion);
    return champion;
});
const getChampion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const traitGuessChampion = yield getTraitGuessChampion();
    const withImagePath = (0, util_1.championWithImagePath)(traitGuessChampion);
    res.json({
        name: withImagePath.name,
        set: withImagePath.set,
        imagePath: withImagePath.imagePath,
    });
});
exports.getChampion = getChampion;
const checkGuess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const traitGuessChampion = yield getTraitGuessChampion();
    const guess = yield models_1.Trait.findOne({
        raw: true,
        where: {
            label: req.params.guess,
        },
    });
    const traits = yield models_1.Trait.findAll({
        raw: true,
        where: {
            champion_id: traitGuessChampion.id,
        },
    });
    if (traits.find((trait) => trait.label.toLowerCase() === req.params.guess.toLowerCase())) {
        res.json({
            correct: true,
            needed: traits.length,
            guess: (0, util_1.traitWithImagePath)(guess),
        });
    }
    else {
        res.json({
            correct: false,
            guess: (0, util_1.traitWithImagePath)(guess),
        });
    }
});
exports.checkGuess = checkGuess;
const getStatClue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const traitGuessChampion = yield getTraitGuessChampion();
    const traits = yield models_1.Trait.findAll({
        raw: true,
        where: {
            champion_id: traitGuessChampion.id,
        },
    });
    res.json({
        cost: traitGuessChampion.cost,
        oneTraitStartsWith: traits[Math.floor(Math.random() * traits.length)].label.charAt(0),
        traitCount: traits.length,
    });
});
exports.getStatClue = getStatClue;
const queryTraits = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const traits = yield models_1.Trait.findAll({
        raw: true,
        where: { label: { [sequelize_1.Op.like]: `%${req.params.query}%` } },
        order: [["label", "ASC"]],
    });
    let unique = [];
    traits.forEach((trait) => {
        if (!unique.map((u) => u.label).find((t) => t === trait.label)) {
            unique.push(trait);
        }
    });
    const startsWith = unique.filter((trait) => trait.label.toLowerCase()[0] === req.params.query.toLowerCase()[0]);
    const results = startsWith
        .filter((trait) => trait.label.toLowerCase().includes(req.params.query.toLowerCase()))
        .slice(0, 10);
    res.json(results
        .map((trait) => {
        const withImagePath = (0, util_1.traitWithImagePath)(trait);
        return {
            label: withImagePath.label,
            imagePath: withImagePath.imagePath,
        };
    })
        .sort((a, b) => {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    }));
});
exports.queryTraits = queryTraits;
const getSameTraitClue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const traitGuessChampion = yield getTraitGuessChampion();
    const traitGuessChampionTraits = yield models_1.Trait.findAll({
        raw: true,
        where: {
            champion_id: traitGuessChampion.id,
        },
    });
    const withInSet = yield models_1.Champion.findAll({
        raw: true,
        where: {
            set: traitGuessChampion.set,
        },
    });
    let championNames = [];
    yield Promise.all(withInSet.map((c) => __awaiter(void 0, void 0, void 0, function* () {
        const traits = yield models_1.Trait.findAll({
            raw: true,
            where: {
                champion_id: c.id,
            },
        });
        if (traits
            .map((t) => t.label)
            .some((traitLabel) => {
            return traitGuessChampionTraits
                .map((t) => t.label)
                .includes(traitLabel);
        })) {
            championNames.push(c.name);
        }
    })));
    res.json(championNames.filter((name) => name !== traitGuessChampion.name));
});
exports.getSameTraitClue = getSameTraitClue;
//# sourceMappingURL=trait-guess.controller.js.map