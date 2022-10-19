import path from "path";

export const devUrl = "http://localhost:8080";
export const publicFolder = path.join(__dirname, "..", "public");
export const frontendFolder = path.join(publicFolder, "frontend");
export const setsFolder = path.join(publicFolder, "sets");
export const prodUrl = "https://oyster-app-jqjom.ondigitalocean.app";
export const sets = ["1", "2", "3", "3.5", "4", "4.5", "5", "5.5"];
export const databaseRoute = "backend-build/database/index.sqlite";
