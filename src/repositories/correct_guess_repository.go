package repositories

import (
	"database/sql"
	"fmt"
	"tftordle/src/utils"
)

func CountCorrectGuessByType(db *sql.DB, guessType utils.GuessType) (uint64, error) {
	row := db.QueryRow("SELECT COUNT(*) FROM correct_guess WHERE guess_type = $1", guessType)

	var count uint64

	err := row.Scan(&count)

	if err != nil {
		fmt.Println("Error counting CorrectGuess by Type", err)
		return 0, err
	}

	return count, nil
}
