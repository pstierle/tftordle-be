import path from "path";

export const devUrl = "http://localhost:8080";
export const publicFolder = path.join(__dirname, "..", "public");
export const setsFolder = path.join(publicFolder, "sets");
export const databaseRoute = path.join(publicFolder, "index.sqlite");
export const prodUrl = "https://tftordle-be-43wsq.ondigitalocean.app";
export const frontendProdUrl = "https://tftordle.com";
export const frontendDevUrl = "http://localhost:4200";
export const sets = [
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
