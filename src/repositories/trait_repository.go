package repositories

import (
	"database/sql"
	"fmt"
	"tftordle/src/models"
)

type TraitRepository struct {
	Db *sql.DB
}

func (r *TraitRepository) FindTraitsByChampionId(championId string) ([]models.Trait, error) {
	query := `
        SELECT t.id, t.name 
        FROM trait t
        JOIN champions_traits ct ON t.id = ct.trait_id
        WHERE ct.champion_id = $1`

	rows, err := r.Db.Query(query)

	if err != nil {
		fmt.Println("Error fetching traits: ", err)
		return nil, err
	}

	defer rows.Close()

	var traits []models.Trait

	for rows.Next() {
		var trait models.Trait

		err := rows.Scan(&trait.ID, &trait.ID)

		if err != nil {
			fmt.Println("Error scanning trait: ", err)
			return nil, err
		}

		traits = append(traits, trait)
	}

	return traits, nil
}

func (r *TraitRepository) FindTraitByName(name string) (models.Trait, error) {
	row := r.Db.QueryRow("SELECT * FROM trait WHERE name = $1", name)

	var trait models.Trait
	err := row.Scan(&trait.ID, &trait.Name)

	if err != nil && err != sql.ErrNoRows {
		fmt.Println("Error fetching trait: ", err)
		return trait, err
	}

	return trait, nil
}

func (r *TraitRepository) FindAllTraits() ([]models.Trait, error) {
	rows, queryErr := r.Db.Query("SELECT * FROM trait")

	if queryErr != nil {
		fmt.Println("Error fetching traits: ", queryErr)
		return nil, queryErr
	}

	defer rows.Close()

	var traits []models.Trait

	for rows.Next() {
		var trait models.Trait
		scanErr := rows.Scan(&trait.ID, &trait.Name)

		if scanErr != nil {
			fmt.Println("Error scanning trait: ", scanErr)
			return nil, scanErr
		}

		traits = append(traits, trait)
	}

	return traits, nil
}

func (r *TraitRepository) InsertTrait(traitName string) (string, error) {
	query := `
		INSERT INTO trait (name)
		VALUES ($1) RETURNING id;
	`

	row := r.Db.QueryRow(query,
		traitName,
	)

	if row.Err() != nil {
		fmt.Println("Error inserting trait: ", traitName, row.Err())
		return "", row.Err()
	}

	var id string
	row.Scan(&id)

	return id, nil
}
