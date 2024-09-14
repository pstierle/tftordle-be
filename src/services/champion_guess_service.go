package services

import (
	"database/sql"
	"tftordle/src/models"
	"tftordle/src/repositories"
	"tftordle/src/utils"
)

func FindGuessChampionByDate(db *sql.DB, date string, guessType utils.GuessType) (models.GuessChampion, error) {
	return repositories.FindGuessChampionByDate(db, date, guessType)
}
