"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trait = exports.TraitGuessChampion = exports.ChampionGuessChampion = exports.Champion = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
exports.Champion = connection_1.database.define("Champion", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cost: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    set: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    range: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});
exports.ChampionGuessChampion = connection_1.database.define("ChampionGuessChampion", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    set: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    created: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
});
exports.TraitGuessChampion = connection_1.database.define("TraitGuessChampion", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    set: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    created: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
});
exports.Trait = connection_1.database.define("Trait", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    label: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    champion_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    set: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});
//# sourceMappingURL=models.js.map