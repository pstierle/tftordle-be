"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sets = exports.frontendDevUrl = exports.frontendProdUrl = exports.prodUrl = exports.databaseRoute = exports.setsFolder = exports.publicFolder = exports.devUrl = void 0;
const path_1 = __importDefault(require("path"));
exports.devUrl = "http://localhost:8080";
exports.publicFolder = path_1.default.join(__dirname, "..", "public");
exports.setsFolder = path_1.default.join(exports.publicFolder, "sets");
exports.databaseRoute = path_1.default.join(exports.publicFolder, "index.sqlite");
exports.prodUrl = "https://tftordle-be-43wsq.ondigitalocean.app";
exports.frontendProdUrl = "https://tftordle.com";
exports.frontendDevUrl = "http://localhost:4200";
exports.sets = [
    "1",
    "2",
    "3",
    "3.5",
    "4",
    "4.5",
    "5",
    "5.5",
    "6",
    "6.5",
    "7",
    "7.5",
];
//# sourceMappingURL=consts.js.map