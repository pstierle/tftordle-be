import {
  TraitGuessChampion,
  Trait,
  Champion,
} from "./../database/models/models";
import { Request, Response } from "express";
import {
  championWithImagePath,
  changeTimeZone,
  traitWithImagePath,
} from "../util/util";
import { Op } from "sequelize";

const getTraitGuessChampion = async () => {
  const today = changeTimeZone(
    new Date(),
    "Europe/Berlin"
  ).toLocaleDateString();

  const traitGuessChampion: any = await TraitGuessChampion.findOne({
    where: {
      created: today,
    },
    raw: true,
  });

  const champion: any = await Champion.findOne({
    raw: true,
    where: {
      name: traitGuessChampion.name,
      set: traitGuessChampion.set,
    },
  });

  console.log("Traitguess Champion: ", champion);

  return champion;
};

export const getChampion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traitGuessChampion: any = await getTraitGuessChampion();

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
  const traitGuessChampion: any = await getTraitGuessChampion();

  const guess: any = await Trait.findOne({
    raw: true,
    where: {
      label: req.params.guess,
    },
  });

  const traits: any = await Trait.findAll({
    raw: true,
    where: {
      champion_id: traitGuessChampion.id,
    },
  });

  if (
    traits.find(
      (trait: any) =>
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
  const traitGuessChampion: any = await getTraitGuessChampion();

  const traits: any = await Trait.findAll({
    raw: true,
    where: {
      champion_id: traitGuessChampion.id,
    },
  });

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
  const traits: any = await Trait.findAll({
    raw: true,
    where: { label: { [Op.like]: `%${req.params.query}%` } },
    order: [["label", "ASC"]],
  });

  let unique: any = [];

  traits.forEach((trait: any) => {
    if (!unique.map((u: any) => u.label).find((t: any) => t === trait.label)) {
      unique.push(trait);
    }
  });

  const startsWith = unique.filter(
    (trait: any) =>
      trait.label.toLowerCase()[0] === req.params.query.toLowerCase()[0]
  );

  const results = startsWith
    .filter((trait: any) =>
      trait.label.toLowerCase().includes(req.params.query.toLowerCase())
    )
    .slice(0, 10);

  res.json(
    results
      .map((trait: any) => {
        const withImagePath = traitWithImagePath(trait);

        return {
          label: withImagePath.label,
          imagePath: withImagePath.imagePath,
        };
      })
      .sort((a: any, b: any) => {
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
  const traitGuessChampion: any = await getTraitGuessChampion();

  const traitGuessChampionTraits: any = await Trait.findAll({
    raw: true,
    where: {
      champion_id: traitGuessChampion.id,
    },
  });

  const withInSet = await Champion.findAll({
    raw: true,
    where: {
      set: traitGuessChampion.set,
    },
  });

  let championNames: string[] = [];

  await Promise.all(
    withInSet.map(async (c: any) => {
      const traits: any = await Trait.findAll({
        raw: true,
        where: {
          champion_id: c.id,
        },
      });

      if (
        traits
          .map((t: any) => t.label)
          .some((traitLabel: string) => {
            return traitGuessChampionTraits
              .map((t: any) => t.label)
              .includes(traitLabel);
          })
      ) {
        championNames.push(c.name);
      }
    })
  );

  res.json(championNames.filter((name) => name !== traitGuessChampion.name));
};
