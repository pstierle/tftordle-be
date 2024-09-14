package repositories

import (
	"database/sql"
	"fmt"
	"os"
	"tftordle/src/models"
	"tftordle/src/utils"
)

func FindGuessChampionByDate(db *sql.DB, date string, guessType utils.GuessType) (models.GuessChampion, error) {
	row := db.QueryRow(`
	    SELECT gc.id, gc.date, gc.guess_type, gc.champion_id, c.id, c.name, c.set, c.cost, c.range, c.gender 
    	FROM guess_champion gc
    	JOIN champion c ON gc.champion_id = c.id
    	WHERE gc.date = $1 AND gc.guess_type = $2
	`, date, guessType)

	var guessChampion models.GuessChampion
	var champion models.Champion

	err := row.Scan(
		&guessChampion.ID,
		&guessChampion.Date,
		&guessChampion.GuessType,
		&guessChampion.ChampionId,
		&champion.ID,
		&champion.Name,
		&champion.Set,
		&champion.Cost,
		&champion.Range,
		&champion.Gender,
	)

	if err != nil {
		return guessChampion, err
	}

	guessChampion.Champion = champion

	return guessChampion, nil
}

func CreateGuessChampionIfNotExists(db *sql.DB, guessType utils.GuessType, date string) {
	row := db.QueryRow("SELECT id FROM guess_champion WHERE guess_type = $1 AND date = $2", guessType, date)

	err := row.Scan()

	if err.Error() == sql.ErrNoRows.Error() {
		fmt.Println("No Guess Champion found for", guessType, date)
		InsertGuessChampion(db, guessType, date)
	}
}

func InsertGuessChampion(db *sql.DB, guessType utils.GuessType, date string) {
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
