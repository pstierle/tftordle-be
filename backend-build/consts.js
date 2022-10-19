"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseRoute = exports.sets = exports.prodUrl = exports.setsFolder = exports.frontendFolder = exports.publicFolder = exports.devUrl = void 0;
const path_1 = __importDefault(require("path"));
exports.devUrl = "http://localhost:8080";
exports.publicFolder = path_1.default.join(__dirname, "..", "public");
exports.frontendFolder = path_1.default.join(exports.publicFolder, "frontend");
exports.setsFolder = path_1.default.join(exports.publicFolder, "sets");
exports.prodUrl = "https://oyster-app-jqjom.ondigitalocean.app";
exports.sets = ["1", "2", "3", "3.5", "4", "4.5", "5", "5.5"];
exports.databaseRoute = "backend-build/database/index.sqlite";
//# sourceMappingURL=consts.js.map