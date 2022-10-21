import { QueryTypes } from "sequelize";
import {
  Champion,
  ChampionGuessChampion,
  Trait,
  TraitGuessChampion,
} from "../database/models/models";
import { database } from "../database/connection";
import { devUrl, prodUrl, sets, publicFolder } from "../consts";

import fs from "fs/promises";

export const secondsUntilMidnight = () => {
  var midnight = new Date();
  midnight.setHours(24);
  midnight.setMinutes(0);
  midnight.setSeconds(0);
  midnight.setMilliseconds(0);
  return (midnight.getTime() - new Date().getTime()) / 1000;
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === "DEV";
};

export const generateRandomGuesses = async () => {
  const today = new Date().toLocaleDateString();

  const championGuessChampion = await ChampionGuessChampion.findOne({
    where: {
      created: today,
    },
  });

  const traitGuessChampion = await TraitGuessChampion.findOne({
    where: {
      created: today,
    },
  });

  if (!championGuessChampion && !traitGuessChampion) {
    await database
      .query("SELECT * FROM `Champions` ORDER BY random() LIMIT 2", {
        type: QueryTypes.SELECT,
        raw: true,
      })
      .then((champions: any[]) => {
        if (champions.length === 0) return;

        ChampionGuessChampion.create({
          name: champions[0].name,
          set: champions[0].set,
          created: today,
        });
        TraitGuessChampion.create({
          name: champions[1].name,
          set: champions[1].set,
          created: today,
        });
      });
  }
};

const getChampionImagePath = (name: string, set: number) => {
  const isDevelopment = process.env.NODE_ENV === "DEV";
  const hostUrl = isDevelopment ? devUrl : prodUrl;

  return `${hostUrl}/sets/${set}/champions/${name
    .toLowerCase()
    .replace("'", "")
    .replace("&", "")
    .replace(" ", "")
    .replace(" ", "")}.png`;
};

const getTraitImagePath = (label: string) => {
  const isDevelopment = process.env.NODE_ENV === "DEV";
  const hostUrl = isDevelopment ? devUrl : prodUrl;
  return `${hostUrl}/sets/traits/${label
    .toLowerCase()
    .replace("-", "")
    .replace(" ", "")}.png`;
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
    imagePath: getChampionImagePath(
      champion.name,
      champion.set.toString().charAt(0)
    ),
  };
};

export const importData = async () => {
  console.log("Importing Data.");
  await Promise.all(
    sets.map(async (set) => {
      const data = await fs.readFile(
        publicFolder + `/sets/${set}/champions.json`,
        "utf-8"
      );
      const champions = JSON.parse(data);
      await Promise.all(
        champions.map(
          async (champion: {
            name: string;
            cost: number;
            set: number;
            range: number;
            traits: string[];
          }) => {
            const parsedChampion: any = {
              name: champion.name,
              set: champion.set,
              cost: champion.cost,
              range: champion.range,
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
