import { QueryTypes } from "sequelize";
import {
  Champion,
  ChampionGuessChampion,
  IChampion,
  IGuessChampion,
  ITrait,
  Trait,
  TraitGuessChampion,
} from "../database/models/models";
import { database } from "../database/connection";
import { devUrl, prodUrl, sets, publicFolder } from "../consts";

import fs from "fs/promises";

export const berlinTodayDateString = () => {
  const today = changeTimeZone(new Date(), "Europe/Berlin");
  const day = today.getDate();
  const month = today.getMonth() + 1;

  let parsed = `${day < 10 ? "0" : ""}${day}/${
    month < 10 ? "0" : ""
  }${month}/${today.getFullYear()}`;

  return parsed;
};

export const berlinYesterdayDateString = () => {
  const today = changeTimeZone(
    new Date(Date.now() - 86400000),
    "Europe/Berlin"
  );
  const day = today.getDate();
  const month = today.getMonth() + 1;

  let parsed = `${day < 10 ? "0" : ""}${day}/${
    month < 10 ? "0" : ""
  }${month}/${today.getFullYear()}`;
  return parsed;
};

export const changeTimeZone = (date: any, timeZone: string) => {
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

const getChampionImagePath = (name: string, set: string) => {
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
    .replace(":", "")
    .split(".")
    .join("")
    .replace(/ /g, "")}.png`;
};

export const traitWithImagePath = (trait: ITrait) => {
  return {
    ...trait,
    imagePath: getTraitImagePath(trait.label),
  };
};

export const championWithImagePath = (champion: IChampion) => {
  return {
    ...champion,
    imagePath: getChampionImagePath(
      champion.name,
      String(champion.set).charAt(0)
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

export const generateGuessChampions = async (days: number) => {
  let dates = [];

  for (let i = 0; i < days; i++) {
    let today = new Date();
    today.setDate(today.getDate() + i);
    dates.push(today.toLocaleDateString());
  }

  const allTaitGuessChampions: IGuessChampion[] =
    (await TraitGuessChampion.findAll({ raw: true })) as any;
  const allChampionGuessChampions: IGuessChampion[] =
    (await ChampionGuessChampion.findAll({ raw: true })) as any;

  const takenTraitGuessDates: string[] = allTaitGuessChampions.map(
    (c) => c.created
  );
  const takenChampionGuessDates: string[] = allChampionGuessChampions.map(
    (c) => c.created
  );

  dates = dates.filter(
    (date) =>
      !takenChampionGuessDates.includes(date) ||
      !takenTraitGuessDates.includes(date)
  );

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
