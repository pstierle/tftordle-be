package repositories

import (
	"database/sql"
	"fmt"
	"tftordle/src/utils"
)

type CorrectGuessRepository struct {
	Db *sql.DB
}

func (r *CorrectGuessRepository) CountByType(guessType utils.GuessType) (uint64, error) {
	row := r.Db.QueryRow("SELECT COUNT(*) FROM correct_guess WHERE guess_type = $1", guessType)

	var count uint64

	err := row.Scan(&count)

	if err != nil {
		fmt.Println("Error counting CorrectGuess by Type", err)
		return 0, err
	}

	return count, nil
}
