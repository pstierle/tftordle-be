import {
  TraitGuessChampion,
  Trait,
  Champion,
  IGuessChampion,
  IChampion,
  ITrait,
} from "./../database/models/models";
import { Request, Response } from "express";
import {
  berlinTodayDateString,
  berlinYesterdayDateString,
  championWithImagePath,
  traitWithImagePath,
} from "../util/util";
import { Op } from "sequelize";

const getTraitGuessChampion = async (): Promise<IChampion> => {
  const traitGuessChampion = (await TraitGuessChampion.findOne({
    where: {
      created: berlinTodayDateString(),
    },
    raw: true,
  })) as unknown as IGuessChampion;

  console.log(traitGuessChampion);

  const champion = (await Champion.findOne({
    raw: true,
    where: {
      name: traitGuessChampion.name,
      set: traitGuessChampion.set,
    },
  })) as unknown as IChampion;

  console.log("\x1b[36m%s\x1b[0m", "Traitguess Champion: ");
  console.log("\x1b[36m%s\x1b[0m", champion);
  return champion;
};

export const getChampion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traitGuessChampion = await getTraitGuessChampion();

  const withImagePath = championWithImagePath(traitGuessChampion);

  res.json({
    name: withImagePath.name,
    set: withImagePath.set,
    imagePath: withImagePath.imagePath,
  });
};

export const checkGuess = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traitGuessChampion = await getTraitGuessChampion();

  const guess = (await Trait.findOne({
    raw: true,
    where: {
      label: req.params.guess,
    },
  })) as unknown as ITrait;

  const traits = (await Trait.findAll({
    raw: true,
    where: {
      champion_id: traitGuessChampion.id,
    },
  })) as unknown as ITrait[];

  if (
    traits.find(
      (trait: ITrait) =>
        trait.label.toLowerCase() === req.params.guess.toLowerCase()
    )
  ) {
    res.json({
      correct: true,
      needed: traits.length,
      guess: traitWithImagePath(guess),
    });
  } else {
    res.json({
      correct: false,
      guess: traitWithImagePath(guess),
    });
  }
};

export const getStatClue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traitGuessChampion = await getTraitGuessChampion();

  const traits = (await Trait.findAll({
    raw: true,
    where: {
      champion_id: traitGuessChampion.id,
    },
  })) as unknown as ITrait[];

  res.json({
    cost: traitGuessChampion.cost,
    oneTraitStartsWith:
      traits[Math.floor(Math.random() * traits.length)].label.charAt(0),
    traitCount: traits.length,
  });
};

export const queryTraits = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traits = (await Trait.findAll({
    raw: true,
    where: { label: { [Op.like]: `%${req.params.query}%` } },
    order: [["label", "ASC"]],
  })) as unknown as ITrait[];

  let unique: ITrait[] = [];

  traits.forEach((trait: ITrait) => {
    if (
      !unique.map((u: ITrait) => u.label).find((t: string) => t === trait.label)
    ) {
      unique.push(trait);
    }
  });

  const startsWith = unique.filter(
    (trait: ITrait) =>
      trait.label.toLowerCase()[0] === req.params.query.toLowerCase()[0]
  );

  const results = startsWith
    .filter((trait: ITrait) =>
      trait.label.toLowerCase().includes(req.params.query.toLowerCase())
    )
    .slice(0, 10);

  res.json(
    results
      .map((trait: ITrait) => {
        const withImagePath = traitWithImagePath(trait);

        return {
          label: withImagePath.label,
          imagePath: withImagePath.imagePath,
        } as ITrait;
      })
      .sort((a: ITrait, b: ITrait) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      })
  );
};

export const getSameTraitClue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traitGuessChampion = await getTraitGuessChampion();

  const traitGuessChampionTraits = (await Trait.findAll({
    raw: true,
    where: {
      champion_id: traitGuessChampion.id,
    },
  })) as unknown as ITrait[];

  const withInSet = (await Champion.findAll({
    raw: true,
    where: {
      set: traitGuessChampion.set,
    },
  })) as unknown as IChampion[];

  let championNames: string[] = [];

  await Promise.all(
    withInSet.map(async (c: IChampion) => {
      const traits = (await Trait.findAll({
        raw: true,
        where: {
          champion_id: c.id,
        },
      })) as unknown as ITrait[];

      if (
        traits
          .map((t: ITrait) => t.label)
          .some((traitLabel: string) => {
            return traitGuessChampionTraits
              .map((t: ITrait) => t.label)
              .includes(traitLabel);
          })
      ) {
        championNames.push(c.name);
      }
    })
  );

  res.json(championNames.filter((name) => name !== traitGuessChampion.name));
};

export const lastChampion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traitGuessChampion = (await TraitGuessChampion.findOne({
    where: {
      created: berlinYesterdayDateString(),
    },
    raw: true,
  })) as unknown as IGuessChampion;
  res.json({
    number: traitGuessChampion.id,
    name: traitGuessChampion.name,
    set: traitGuessChampion.set,
  });
};
