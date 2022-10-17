import {
  ChampionGuessChampion,
  Champion,
  Trait,
} from "./../database/models/models";
import { Request, Response } from "express";
import { championWithImagePath } from "../util/util";
import { Op } from "sequelize";

const getGuessChampion = async () => {
  const guessChampion: any = await ChampionGuessChampion.findOne({
    order: [["createdAt", "DESC"]],
    raw: true,
  });

  const champion: any = await Champion.findByPk(guessChampion.id, {
    raw: true,
  });

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
    results.map((champion: any) => {
      const withImagePath = championWithImagePath(champion);
      return {
        id: withImagePath.id,
        name: withImagePath.name,
        set: withImagePath.set,
        cost: withImagePath.cost,
        imagePath: withImagePath.imagePath,
      };
    })
  );
};

export const checkGuessAttr = async (
  req: Request,
  res: Response
): Promise<void> => {
  const guessChampion: any = await getGuessChampion();
  console.log(guessChampion);
  const userGuessChampion: any = await Champion.findByPk(req.params.id, {
    raw: true,
  });

  const searchValue = (guessChampion as any)[req.params.attr];
  const userGuessValue = (userGuessChampion as any)[req.params.attr];

  if (req.params.attr === "traits") {
    let matchState = "wrong";

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
        if (userGuessChampionTraits.map((t: any) => t.label).includes(trait))
          matchState = "some";
      });
    if (
      JSON.stringify(guessChampionTraits) ===
      JSON.stringify(userGuessChampionTraits)
    ) {
      matchState = "exact";
    }
    res.json({
      matchState: matchState,
      userGuessValue: userGuessChampionTraits.map((t: any) => t.label),
    });
  } else {
    if (userGuessValue === searchValue) {
      res.json({
        matchState: "exact",
        userGuessValue: userGuessValue,
      });
    }
    if (userGuessValue > searchValue) {
      res.json({
        matchState: "lower",
        userGuessValue: userGuessValue,
      });
    }
    if (userGuessValue < searchValue) {
      res.json({
        matchState: "higher",
        userGuessValue: userGuessValue,
      });
    }
  }
};
