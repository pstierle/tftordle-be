"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const consts_1 = require("./../consts");
const sequelize_1 = require("sequelize");
exports.database = new sequelize_1.Sequelize({
    dialect: "sqlite",
    storage: consts_1.databaseRoute,
});
//# sourceMappingURL=connection.js.map