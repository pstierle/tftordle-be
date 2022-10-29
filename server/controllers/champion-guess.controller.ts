import {
  ChampionGuessChampion,
  Champion,
  Trait,
} from "./../database/models/models";
import { Request, Response } from "express";
import {
  berlinTodayDateString,
  berlinYesterdayDateString,
  championWithImagePath,
} from "../util/util";
import { Op } from "sequelize";

type Match = "exact" | "higher" | "lower" | "wrong" | "some";

const getGuessChampion = async () => {
  const guessChampion: any = await ChampionGuessChampion.findOne({
    where: {
      created: berlinTodayDateString(),
    },
    raw: true,
  });

  const champion: any = await Champion.findOne({
    raw: true,
    where: {
      name: guessChampion.name,
      set: guessChampion.set,
    },
  });

  console.log("Championguess Champion: ", champion);

  return champion;
};

export const queryChampions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const champions: any = await Champion.findAll({
    raw: true,
    where: { name: { [Op.like]: `%${req.params.query}%` } },
    order: [["name", "ASC"]],
  });

  const results = champions
    .filter(
      (champion: any) =>
        champion.name.toLowerCase()[0] === req.params.query.toLowerCase()[0]
    )
    .slice(0, 10);

  res.json(
    results
      .map((champion: any) => {
        const withImagePath = championWithImagePath(champion);
        return {
          id: withImagePath.id,
          name: withImagePath.name,
          set: withImagePath.set,
          cost: withImagePath.cost,
          imagePath: withImagePath.imagePath,
          range: withImagePath.range,
        };
      })
      .sort((a: any, b: any) => {
        if (a.set < b.set) {
          return -1;
        }
        if (a.set > b.set) {
          return 1;
        }
        return 0;
      })
  );
};

type Result = {
  attrLabel: string;
  matchState: Match;
  userGuessValue: any;
};

export const checkGuessAttr = async (
  req: Request,
  res: Response
): Promise<void> => {
  const attrs = ["set", "cost", "range", "traits"];
  let results: Result[] = [];

  const guessChampion: any = await getGuessChampion();
  const userGuessChampion: any = await Champion.findByPk(req.params.id, {
    raw: true,
  });

  await Promise.all(
    attrs.map(async (attr) => {
      const searchValue = (guessChampion as any)[attr];
      let userGuessValue = (userGuessChampion as any)[attr];

      let result: Result = {
        attrLabel: attr,
        matchState: "wrong",
        userGuessValue: userGuessValue,
      };

      if (attr === "traits") {
        const guessChampionTraits = await Trait.findAll({
          raw: true,
          where: {
            champion_id: guessChampion.id,
          },
        });

        const userGuessChampionTraits = await Trait.findAll({
          raw: true,
          where: {
            champion_id: userGuessChampion.id,
          },
        });

        guessChampionTraits
          .map((t: any) => t.label)
          .forEach((trait: any) => {
            if (
              userGuessChampionTraits.map((t: any) => t.label).includes(trait)
            )
              result.matchState = "some";
          });
        if (
          JSON.stringify(guessChampionTraits) ===
          JSON.stringify(userGuessChampionTraits)
        ) {
          result.matchState = "exact";
        }
        result.userGuessValue = userGuessChampionTraits.map(
          (t: any) => t.label
        );
      } else {
        if (userGuessValue === searchValue) {
          result.matchState = "exact";
        }
        if (userGuessValue > searchValue) {
          result.matchState = "lower";
        }
        if (userGuessValue < searchValue) {
          result.matchState = "higher";
        }
      }

      results.push(result);
    })
  );

  res.json(results);
};

export const lastChampion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const guessChampion: any = await ChampionGuessChampion.findOne({
    where: {
      created: berlinYesterdayDateString(),
    },
    raw: true,
  });
  res.json({
    number: guessChampion.id,
    name: guessChampion.name,
    set: guessChampion.set,
  });
};
