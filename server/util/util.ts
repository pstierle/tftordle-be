import { QueryTypes } from "sequelize";
import {
  Champion,
  ChampionGuessChampion,
  Trait,
  TraitGuessChampion,
} from "../database/models/models";
import { database } from "../database/connection";
import { devUrl, prodUrl, sets } from "../consts";

import fs from "fs/promises";

export const secondsUntilMidnight = () => {
  var midnight = new Date();
  midnight.setHours(24);
  midnight.setMinutes(0);
  midnight.setSeconds(0);
  midnight.setMilliseconds(0);
  return (midnight.getTime() - new Date().getTime()) / 1000;
};

const isDevelopment = process.env.NODE_ENV === "DEV";
const baseIntervall = isDevelopment ? 600 : 86400;
let timer = isDevelopment ? 600 : secondsUntilMidnight();

const generateRandomGuesses = async () => {
  await database
    .query("SELECT * FROM `Champions` ORDER BY random() LIMIT 2", {
      type: QueryTypes.SELECT,
      raw: true,
    })
    .then((champions: any[]) => {
      ChampionGuessChampion.create({
        champion_id: champions[0].id,
      });
      TraitGuessChampion.create({
        champion_id: champions[0].id,
      });
    })
    .catch((error) => {
      throw error;
    });
};

export const resetGuessesIntervall = async () => {
  if (!isDevelopment) await generateRandomGuesses();

  setInterval(async () => {
    timer -= 1;
    if (timer === 0) {
      timer = baseIntervall;
      await generateRandomGuesses();
    }
  }, 1000);
};

const getChampionImagePath = (name: string, set: number) => {
  const isDevelopment = process.env.NODE_ENV === "DEV";
  const hostUrl = isDevelopment ? devUrl : prodUrl;

  return `${hostUrl}/sets/${set}/champions/${name
    .toLowerCase()
    .replace("'", "")
    .replace("&", "")
    .replace(" ", "")}.png`;
};

const getTraitImagePath = (label: string) => {
  const isDevelopment = process.env.NODE_ENV === "DEV";
  const hostUrl = isDevelopment ? devUrl : prodUrl;
  return `${hostUrl}/sets/traits/${label.toLowerCase().replace(" ", "")}.png`;
};

export const traitWithImagePath = (trait: any) => {
  return {
    ...trait,
    imagePath: getTraitImagePath(trait.label),
  };
};

export const championWithImagePath = (champion: any) => {
  return {
    ...champion,
    imagePath: getChampionImagePath(champion.name, champion.set),
  };
};

export const importData = async () => {
  console.log("Importing Data.");
  await Promise.all(
    sets.map(async (set) => {
      const data = await fs.readFile(
        __dirname + `/../sets/${set}/champions.json`,
        "utf-8"
      );
      const champions = JSON.parse(data);
      await Promise.all(
        champions.map(
          async (champion: {
            name: string;
            cost: number;
            traits: string[];
          }) => {
            const parsedChampion: any = {
              name: champion.name,
              set: Number(set),
              cost: champion.cost,
            };
            await Champion.create({
              ...parsedChampion,
            }).then(async (c: any) => {
              await Promise.all(
                champion.traits.map(async (trait: string) => {
                  const parsedLabel = trait
                    .replace("_", "")
                    .replace(/[0-9]/g, "")
                    .replace("Set", "");
                  const parsedTrait = {
                    label: parsedLabel,
                    set: Number(set),
                    champion_id: c.id,
                  };

                  await Trait.create({
                    ...parsedTrait,
                  });
                })
              );
            });
          }
        )
      );
    })
  );
};
