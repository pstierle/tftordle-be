package services

import (
	"database/sql"
	"tftordle/src/repositories"
	"tftordle/src/utils"
)

func CountCorrectGuessByType(db *sql.DB, guessType utils.GuessType) uint64 {
	return repositories.CountCorrectGuessByType(db, guessType)
}
