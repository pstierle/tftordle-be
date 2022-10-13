require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;
var fs = require("fs");
const isDevelopment = process.env.NODE_ENV === "DEV"
const devUrl = "http://localhost:8080";
const prodUrl = "https://tftordle-9wpzx.ondigitalocean.app"
const hostUrl = isDevelopment ? devUrl : prodUrl;

var corsOptions = {
    origin: true,
};

app.use(cors(corsOptions));
app.use(express.static(__dirname + "/sets"));
app.use(express.static(__dirname + "/frontend-build"));

const sets = ["2", "3", "3.5", "4", "4.5", "5", "5.5"];
let allChampions = [];
let allTraits = [];
let traitGuessChampion = undefined;
let championGuessChampion = undefined;

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/frontend-build/index.html");
});

app.get("/trait-guess-champion", async (req, res) => {
    return res.json({
        name: traitGuessChampion.name,
        set: traitGuessChampion.set,
        imagePath: traitGuessChampion.imagePath,
    });
});


app.get("/champion-guess-champion", async (req, res) => {
    return res.json(championGuessChampion);
});

app.get("/same-trait-clue", async (req, res) => {
    const withInSet = allChampions.filter(c => c.set === traitGuessChampion.set);
    const withSameTrait = withInSet.filter(c => c.traits.some(t => traitGuessChampion.traits.includes(t)))
    res.json(withSameTrait.map(c => c.name));
});

app.get("/stat-clue", async (req, res) => {
    res.json({
        cost: traitGuessChampion.cost,
        oneTraitStartsWith: traitGuessChampion.traits[Math.floor(Math.random() * traitGuessChampion.traits.length)].charAt(0),
        traitCount: traitGuessChampion.traitCount
    });
});

app.get("/check-guess/:guess", async (req, res) => {
    const guess = allTraits.find(t => t.label === req.params.guess);

    if (traitGuessChampion.traits.find((trait) => trait.toLowerCase() === req.params.guess.toLowerCase())) {
        res.json({
            correct: true,
            needed: traitGuessChampion.traits.length,
            guess: guess
        });
    } else {
        res.json({
            correct: false,
            guess: guess
        });
    }
});

app.get("/query-traits/:query", async (req, res) => {
    const startsWith = allTraits.filter((trait) =>
        trait.label.toLowerCase()[0] === req.params.query.toLowerCase()[0]
    );

    const results = startsWith.filter((trait) => trait.label.toLowerCase().includes(req.params.query.toLowerCase())).slice(0, 10);

    res.json(results.sort((x, y) => {
        if (x.label > y.label) {
            return 1;
        }
        if (x.label < y.label) {
            return -1;
        }
        return 0;
    }));
});

app.get("/query-champions/:query", async (req, res) => {
    const results = allChampions.filter((champion) =>
        champion.name.toLowerCase().includes(req.params.query.toLowerCase())
    );
    res.json(results);
});

app.get("/reset-guesses-timer", async (req, res) => {
    res.json(timer);
});

function resetGuesses() {
    traitGuessChampion =
        allChampions[Math.floor(Math.random() * allChampions.length)];

    championGuessChampion =
        allChampions[Math.floor(Math.random() * allChampions.length)];
}

function secondsUntilMidnight() {
  var midnight = new Date();
  midnight.setHours( 24 );
  midnight.setMinutes( 0 );
  midnight.setSeconds( 0 );
  midnight.setMilliseconds( 0 );
  return ( midnight.getTime() - new Date().getTime() ) / 1000;
}

// 24 Hours
const baseIntervall = isDevelopment ? 600 : 86400;

let timer = isDevelopment ? 600 : secondsUntilMidnight();

app.listen(port, async () => {
    console.log(`Listening on port ${port}`);

    // Calc Time until 0:00

    setInterval(() => {
        timer -= 1;
        if (timer === 0) {
            timer = baseIntervall;
            resetGuesses();
        }
    }, 1000)

    sets.forEach((set) => {
        fs.readFile(
            __dirname + `/sets/${set}/champions.json`,
            "utf-8",
            (err, data) => {
                let champions = JSON.parse(data);
                champions.forEach((champion) => {

                    const parsedTraits = champion.traits.map((trait) =>
                        trait.replace("_", "").replace(/[0-9]/g, "").replace("Set", "")
                    );

                    const parsed = {
                        id: champion.championId ?? champion.champion,
                        name: champion.name ?? champion.champion,
                        traits: parsedTraits,
                        set: set,
                        traitCount: parsedTraits.length,
                        imagePath: `${hostUrl}/${set}/champions/${champion.name.toLowerCase().replace("'", "").replace("&", "").replace(" ", "")}.png`,
                        cost: champion.cost,
                        firstApperance: 0
                    };

                    parsed.traits.forEach((trait) => {
                        const found = allTraits.find(t => t.label === trait);
                        if (!found) {
                            allTraits.push({
                                label: trait,
                                imagePath: `${hostUrl}/traits/${trait.toLowerCase().replace(' ', '').replace('-', '')}.png`
                            });
                        }
                    });

                    allChampions.push(parsed);

                    resetGuesses();
                });
            }

        );
    });
});
