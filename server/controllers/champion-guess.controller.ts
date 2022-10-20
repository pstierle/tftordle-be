import {
  ChampionGuessChampion,
  Champion,
  Trait,
} from "./../database/models/models";
import { Request, Response } from "express";
import { championWithImagePath } from "../util/util";
import { Op } from "sequelize";

type Match = "exact" | "higher" | "lower" | "wrong" | "some";

const getGuessChampion = async () => {
  const guessChampion: any = await ChampionGuessChampion.findAll({
    order: [["created", "DESC"]],
    limit: 1,
    raw: true,
  });

  const champion: any = await Champion.findOne({
    raw: true,
    where: {
      name: guessChampion[0].name,
      set: guessChampion[0].set,
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

export const checkGuessAttr = async (
  req: Request,
  res: Response
): Promise<void> => {
  const attrs = ["set", "cost", "traits"];

  let setResult: {
    attrLabel: string;
    matchState: Match;
    userGuessValue: any;
  } = {
    attrLabel: "set",
    matchState: undefined,
    userGuessValue: undefined,
  };

  let costResult: {
    attrLabel: string;
    matchState: Match;
    userGuessValue: any;
  } = {
    attrLabel: "cost",
    matchState: undefined,
    userGuessValue: undefined,
  };

  let traitsResult: {
    attrLabel: string;
    matchState: Match;
    userGuessValue: any;
  } = {
    attrLabel: "traits",
    matchState: undefined,
    userGuessValue: undefined,
  };

  const guessChampion: any = await getGuessChampion();
  const userGuessChampion: any = await Champion.findByPk(req.params.id, {
    raw: true,
  });

  await Promise.all(
    attrs.map(async (attr) => {
      const searchValue = (guessChampion as any)[attr];
      let userGuessValue = (userGuessChampion as any)[attr];
      let matchState: Match = "wrong";

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
              matchState = "some";
          });
        if (
          JSON.stringify(guessChampionTraits) ===
          JSON.stringify(userGuessChampionTraits)
        ) {
          matchState = "exact";
        }
        userGuessValue = userGuessChampionTraits.map((t: any) => t.label);
      } else {
        if (userGuessValue === searchValue) {
          matchState = "exact";
        }
        if (userGuessValue > searchValue) {
          matchState = "lower";
        }
        if (userGuessValue < searchValue) {
          matchState = "higher";
        }
      }

      if (attr === "set") {
        setResult.matchState = matchState;
        setResult.userGuessValue = userGuessValue;
      }

      if (attr === "cost") {
        costResult.matchState = matchState;
        costResult.userGuessValue = userGuessValue;
      }

      if (attr === "traits") {
        traitsResult.matchState = matchState;
        traitsResult.userGuessValue = userGuessValue;
      }
    })
  );

  res.json([setResult, traitsResult, costResult]);
};
