package repositories

import (
	"database/sql"
	"fmt"
	"tftordle/src/models"
)

func FindTraitByName(db *sql.DB, name string) (models.Trait, error) {
	row := db.QueryRow("SELECT * FROM trait WHERE name = $1", name)

	var trait models.Trait
	err := row.Scan(&trait.ID, &trait.Name)

	if err != nil && err != sql.ErrNoRows {
		fmt.Println("Error fetching trait: ", err)
		return trait, err
	}

	return trait, nil
}

func FindAllTraits(db *sql.DB) ([]models.Trait, error) {
	rows, queryErr := db.Query("SELECT * FROM trait")

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

func InsertTrait(db *sql.DB, traitName string) (string, error) {
	query := `
		INSERT INTO trait (name)
		VALUES ($1) RETURNING id;
	`

	row := db.QueryRow(query,
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
