package repositories

import (
	"database/sql"
	"fmt"
	"tftordle/src/models"
	"tftordle/src/utils"
)

type GuessChampionRepository struct {
	Db *sql.DB
}

func (r *GuessChampionRepository) FindByDateAndGuessType(date string, guessType utils.GuessType) (models.GuessChampion, error) {
	row := r.Db.QueryRow(`
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
		fmt.Println("Error fetching guess champion", err)
		return guessChampion, err
	}

	guessChampion.Champion = champion

	return guessChampion, nil
}

func (r *GuessChampionRepository) CreateIfNotExists(guessType utils.GuessType, date string) error {
	row := r.Db.QueryRow("SELECT id FROM guess_champion WHERE guess_type = $1 AND date = $2", guessType, date)

	err := row.Scan()

	if err.Error() == sql.ErrNoRows.Error() {
		fmt.Println("No Guess Champion found for", guessType, date)
		insertErr := r.Create(guessType, date)

		if insertErr != nil {
			fmt.Println("Error creating guess champion", insertErr)
			return insertErr
		}
	}

	return nil
}

func (r *GuessChampionRepository) Create(guessType utils.GuessType, date string) error {
	championId, fetchErr := RandomChampionId(r.Db)

	if fetchErr != nil {
		fmt.Println("Error fetching random champion id", fetchErr)
		return fetchErr
	}

	query := `
		INSERT INTO guess_champion (date, guess_type, champion_id)
		VALUES ($1, $2, $3);
	`

	_, insertErr := r.Db.Exec(query, date, guessType, championId)

	if insertErr != nil {
		fmt.Println("Error inserting guess champion", insertErr)
		return insertErr
	}

	return nil
}
