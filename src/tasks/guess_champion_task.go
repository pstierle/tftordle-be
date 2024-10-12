package tasks

import (
	"fmt"
	"tftordle/src/repositories"
	"tftordle/src/utils"

	"github.com/robfig/cron/v3"
)

func StartGuessChampionTask(r *repositories.GuessChampionRepository) {
	SyncGuessChampion(r, utils.CHAMPION)
	SyncGuessChampion(r, utils.TRAIT)

	c := cron.New()
	c.AddFunc("@every day", func() { SyncGuessChampion(r, utils.CHAMPION) })
	c.AddFunc("@every day", func() { SyncGuessChampion(r, utils.TRAIT) })
	c.Start()
}

func SyncGuessChampion(r *repositories.GuessChampionRepository, guessType utils.GuessType) {
	fmt.Println("Checking Guess Champion of Type", guessType)
	r.CreateIfNotExists(guessType, utils.GuessChampionDateToday())
	r.CreateIfNotExists(guessType, utils.GuessChampionDateYesterday())
}
