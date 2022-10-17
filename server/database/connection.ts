import { databaseRoute } from "./../consts";
import { Sequelize } from "sequelize";

export const database = new Sequelize({
  dialect: "sqlite",
  storage: databaseRoute,
});
