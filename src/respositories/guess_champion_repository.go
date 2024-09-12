package respositories

import (
	"database/sql"
	"fmt"
	"os"
)

func CreateGuessChampionIfNotExists(db *sql.DB, guessType string, date string) {
	row := db.QueryRow("SELECT id FROM guess_champion WHERE guess_type = $1 AND date = $2", guessType, date)

	err := row.Scan()

	if err.Error() == sql.ErrNoRows.Error() {
		fmt.Println("No Guess Champion found for", guessType, date)
		InsertGuessChampion(db, guessType, date)
	}
}

func InsertGuessChampion(db *sql.DB, guessType string, date string) {
	championId := RandomChampionId(db)

	query := `
		INSERT INTO guess_champion (date, guess_type, champion_id)
		VALUES ($1, $2, $3);
	`

	_, err := db.Exec(query, date, guessType, championId)

	if err != nil {
		fmt.Println("Error inserting guess champion", err)
		os.Exit(1)
	}
}
