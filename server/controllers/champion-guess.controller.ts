import {
  ChampionGuessChampion,
  Champion,
  Trait,
  IGuessChampion,
  IChampion,
  ITrait,
} from "./../database/models/models";
import { Request, Response } from "express";
import {
  berlinTodayDateString,
  berlinYesterdayDateString,
  championWithImagePath,
} from "../util/util";
import { Op } from "sequelize";

type Match = "exact" | "higher" | "lower" | "wrong" | "some";

const getGuessChampion = async (): Promise<IChampion> => {
  const guessChampion = (await ChampionGuessChampion.findOne({
    where: {
      created: berlinTodayDateString(),
    },
    raw: true,
  })) as unknown as IGuessChampion;

  const champion = (await Champion.findOne({
    raw: true,
    where: {
      name: guessChampion.name,
      set: guessChampion.set,
    },
  })) as unknown as IChampion;

  console.log("\x1b[36m%s\x1b[0m", "Championguess Champion: ");
  console.log("\x1b[36m%s\x1b[0m", champion);
  return champion;
};

export const queryChampions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const champions: IChampion[] = (await Champion.findAll({
    raw: true,
    where: { name: { [Op.like]: `%${req.params.query}%` } },
    order: [["name", "ASC"]],
  })) as unknown as IChampion[];

  const results = champions
    .filter(
      (champion: IChampion) =>
        champion.name.toLowerCase()[0] === req.params.query.toLowerCase()[0]
    )
    .slice(0, 10);

  res.json(
    results
      .map((champion: IChampion) => {
        const withImagePath = championWithImagePath(champion);
        return {
          id: withImagePath.id,
          name: withImagePath.name,
          set: withImagePath.set,
          cost: withImagePath.cost,
          imagePath: withImagePath.imagePath,
          range: withImagePath.range,
        } as IChampion;
      })
      .sort((a: IChampion, b: IChampion) => {
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
  attribute: string;
  match: Match;
  value: any;
};

export const checkGuessAttr = async (
  req: Request,
  res: Response
): Promise<void> => {
  const attrs = ["set", "cost", "range", "traits"];
  let results: Result[] = [];

  const guessChampion = await getGuessChampion();
  const userGuessChampion = (await Champion.findByPk(req.params.id, {
    raw: true,
  })) as unknown as IChampion;

  await Promise.all(
    attrs.map(async (attr) => {
      const searchValue = (guessChampion as any)[attr];
      let userGuessValue = (userGuessChampion as any)[attr];

      let result: Result = {
        attribute: attr,
        match: "wrong",
        value: userGuessValue,
      };

      if (attr === "traits") {
        const guessChampionTraits = (await Trait.findAll({
          raw: true,
          where: {
            champion_id: guessChampion.id,
          },
        })) as unknown as ITrait[];

        const userGuessChampionTraits = (await Trait.findAll({
          raw: true,
          where: {
            champion_id: userGuessChampion.id,
          },
        })) as unknown as ITrait[];

        guessChampionTraits
          .map((t: ITrait) => t.label)
          .forEach((trait: string) => {
            if (
              userGuessChampionTraits
                .map((t: ITrait) => t.label)
                .includes(trait)
            )
              result.match = "some";
          });
        if (
          JSON.stringify(guessChampionTraits) ===
          JSON.stringify(userGuessChampionTraits)
        ) {
          result.match = "exact";
        }
        result.value = userGuessChampionTraits.map((t: ITrait) => t.label);
      } else {
        if (userGuessValue === searchValue) {
          result.match = "exact";
        }
        if (userGuessValue > searchValue) {
          result.match = "lower";
        }
        if (userGuessValue < searchValue) {
          result.match = "higher";
        }
      }

      results.push(result);
    })
  );

  res.json(results);
};

export const getTraitClue = async (req: Request, res: Response) => {
  const guessChampion = await getGuessChampion();
  const traits = (await Trait.findAll({
    raw: true,
    where: {
      champion_id: guessChampion.id,
    },
  })) as unknown as ITrait[];
  res.json(traits.map((t) => t.label).sort());
};

export const lastChampion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const lastChampion: any = (await ChampionGuessChampion.findOne({
    where: {
      created: berlinYesterdayDateString(),
    },
    raw: true,
  })) as unknown as IGuessChampion;

  if (lastChampion) {
    res.json({
      number: lastChampion.id,
      name: lastChampion.name,
      set: lastChampion.set,
    });
  } else {
    res.json(undefined);
  }
};
