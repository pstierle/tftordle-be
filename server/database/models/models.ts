import { DataTypes } from "sequelize";
import { database } from "../connection";

export interface IGuessChampion {
  id: Number;
  name: string;
  set: Number;
  created: string;
}

export interface IChampion {
  id: Number;
  name: string;
  cost: Number;
  set: Number;
  range: Number;
  imagePath?: string;
}

export interface ITrait {
  id: Number;
  label: string;
  set: Number;
  champion_id: Number;
  imagePath?: string;
}

export const Champion = database.define(
  "Champion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    set: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    range: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export const ChampionGuessChampion = database.define(
  "ChampionGuessChampion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    set: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export const TraitGuessChampion = database.define(
  "TraitGuessChampion",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    set: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export const Trait = database.define(
  "Trait",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    champion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    set: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);
