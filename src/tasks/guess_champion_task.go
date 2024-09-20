package tasks

import (
	"database/sql"
	"fmt"
	"tftordle/src/repositories"
	"tftordle/src/utils"

	"github.com/robfig/cron/v3"
)

func StartGuessChampionTask(db *sql.DB) {
	SyncGuessChampion(db, utils.CHAMPION)
	SyncGuessChampion(db, utils.TRAIT)

	c := cron.New()
	c.AddFunc("@every day", func() { SyncGuessChampion(db, utils.CHAMPION) })
	c.AddFunc("@every day", func() { SyncGuessChampion(db, utils.TRAIT) })
	c.Start()
}

func SyncGuessChampion(db *sql.DB, guessType utils.GuessType) {
	fmt.Println("Checking Guess Champion of Type", guessType)
	repositories.CreateGuessChampionIfNotExists(db, guessType, utils.GuessChampionDateToday())
	repositories.CreateGuessChampionIfNotExists(db, guessType, utils.GuessChampionDateYesterday())
}
