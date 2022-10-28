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

export const changeTimeZone = (date: any, timeZone: any) => {
  if (typeof date === "string") {
    return new Date(
      new Date(date).toLocaleString("en-US", {
        timeZone,
      })
    );
  }

  return new Date(
    date.toLocaleString("en-US", {
      timeZone,
    })
  );
};

export const secondsUntilMidnight = () => {
  const berlinDate = changeTimeZone(new Date(), "Europe/Berlin");
  const midnight = changeTimeZone(new Date(), "Europe/Berlin");
  midnight.setHours(24, 0, 0, 0);
  return (midnight.getTime() - berlinDate.getTime()) / 1000;
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === "DEV";
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

export const nextDays = async () => {
  let dates = [];

  for (let i = 1; i < 64; i++) {
    let today = new Date();
    today.setDate(today.getDate() + i);
    dates.push(today.toLocaleDateString());
  }

  let randomChampions: any = [];

  await database
    .query(
      "SELECT * FROM `Champions` ORDER BY random() LIMIT " + dates.length * 2,
      {
        type: QueryTypes.SELECT,
        raw: true,
      }
    )
    .then((champions: any[]) => {
      randomChampions = champions;
    });

  let takenIndecies: number[] = [];

  dates.forEach((date, i) => {
    console.log(date);

    let randomIndex = Math.floor(Math.random() * randomChampions.length);

    while (takenIndecies.includes(randomIndex)) {
      randomIndex = Math.floor(Math.random() * randomChampions.length);
    }

    ChampionGuessChampion.create({
      name: randomChampions[randomIndex].name,
      set: randomChampions[randomIndex].set,
      created: date,
    });

    takenIndecies.push(randomIndex);

    while (takenIndecies.includes(randomIndex)) {
      randomIndex = Math.floor(Math.random() * randomChampions.length);
    }
    takenIndecies.push(randomIndex);

    TraitGuessChampion.create({
      name: randomChampions[randomIndex].name,
      set: randomChampions[randomIndex].set,
      created: date,
    });
  });
};
