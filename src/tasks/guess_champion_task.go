package tasks

import (
	"fmt"
	"tftordle/src/repositories"
	"tftordle/src/utils"

	"github.com/robfig/cron/v3"
)

func StartGuessChampionTask(r *repositories.GuessChampionRepository, cr *repositories.ChampionRepository) {
	SyncGuessChampion(r, utils.CHAMPION, cr)
	SyncGuessChampion(r, utils.TRAIT, cr)

	c := cron.New()
	c.AddFunc("@every day", func() { SyncGuessChampion(r, utils.CHAMPION, cr) })
	c.AddFunc("@every day", func() { SyncGuessChampion(r, utils.TRAIT, cr) })
	c.Start()
}

func SyncGuessChampion(r *repositories.GuessChampionRepository, guessType utils.GuessType, cr *repositories.ChampionRepository) {
	fmt.Println("Checking Guess Champion of Type", guessType)
	r.CreateIfNotExists(guessType, utils.GuessChampionDateToday(), cr)
	r.CreateIfNotExists(guessType, utils.GuessChampionDateYesterday(), cr)
}
