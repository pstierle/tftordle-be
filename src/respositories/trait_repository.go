package respositories

import (
	"database/sql"
	"fmt"
	"os"
	"tftordle/src/models"
)

func FindTraitByName(db *sql.DB, name string) models.Trait {
	row := db.QueryRow("SELECT * FROM trait WHERE name = $1", name)

	var trait models.Trait
	err := row.Scan(&trait.ID, &trait.Name)

	if err != nil && err != sql.ErrNoRows {
		fmt.Println("Error fetching trait: ", err)
		os.Exit(1)
	}

	return trait
}

func FindAllTraits(db *sql.DB) []models.Trait {
	rows, queryErr := db.Query("SELECT * FROM trait")

	if queryErr != nil {
		fmt.Println("Error fetching traits: ", queryErr)
		os.Exit(1)
	}

	defer rows.Close()

	var traits []models.Trait

	for rows.Next() {
		var trait models.Trait
		scanErr := rows.Scan(&trait.ID, &trait.Name)

		if scanErr != nil {
			fmt.Println("Error scanning trait: ", scanErr)
			os.Exit(1)
		}

		traits = append(traits, trait)
	}

	return traits
}

func InsertTrait(db *sql.DB, traitName string) string {
	query := `
		INSERT INTO trait (name)
		VALUES ($1) RETURNING id;
	`

	row := db.QueryRow(query,
		traitName,
	)

	if row.Err() != nil {
		fmt.Println("Error inserting trait: ", traitName, row.Err())
		os.Exit(1)
	}

	var id string
	row.Scan(&id)

	return id
}
