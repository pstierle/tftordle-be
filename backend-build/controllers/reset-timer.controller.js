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
exports.getResetTimer = exports.resetGuessesIntervall = void 0;
const util_1 = require("../util/util");
let timer = (0, util_1.isDevelopment)() ? 600 : (0, util_1.secondsUntilMidnight)();
const baseIntervall = (0, util_1.isDevelopment)() ? 600 : 86400;
const resetGuessesIntervall = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, util_1.generateRandomGuesses)();
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        timer -= 1;
        if (timer === 0) {
            timer = baseIntervall;
            yield (0, util_1.generateRandomGuesses)();
        }
    }), 1000);
});
exports.resetGuessesIntervall = resetGuessesIntervall;
const getResetTimer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json("test");
});
exports.getResetTimer = getResetTimer;
//# sourceMappingURL=reset-timer.controller.js.map