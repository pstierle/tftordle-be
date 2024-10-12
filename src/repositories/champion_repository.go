package repositories

import (
	"database/sql"
	"fmt"
	"tftordle/src/models"
	"tftordle/src/models/requests"
)

type ChampionRepository struct {
	Db *sql.DB
}

func (r *ChampionRepository) FindByFilter(filter requests.QueryRequest) ([]models.Champion, error) {
	var excludeCondition string
	var args []interface{}

	query := "SELECT * FROM champion WHERE name LIKE '%' || $1 || '%'"

	args = append(args, filter.Query)

	if len(filter.ExcludeIds) > 0 {
		excludeCondition = " AND id NOT IN ("
		for i, id := range filter.ExcludeIds {
			if i > 0 {
				excludeCondition += ", "
			}
			excludeCondition += fmt.Sprintf("$%d", i+2)
			args = append(args, id)
		}
		excludeCondition += ")"
		query += excludeCondition
	}

	query += " ORDER BY name, set LIMIT 20"

	rows, queryErr := r.Db.Query(query, args...)

	if queryErr != nil {
		fmt.Println("Error quering champions: ", queryErr)
		return nil, queryErr
	}

	defer rows.Close()

	var champions []models.Champion

	for rows.Next() {
		var champion models.Champion
		scanErr := rows.Scan(&champion.ID, &champion.Name, &champion.Set, &champion.Cost, &champion.Range, &champion.Gender)

		if scanErr != nil {
			fmt.Println("Error scanning champion: ", scanErr)
			return nil, scanErr
		}

		champions = append(champions, champion)
	}

	return champions, nil
}

func FindAllChampions(db *sql.DB) ([]models.Champion, error) {
	rows, queryErr := db.Query("SELECT * FROM champion")

	if queryErr != nil {
		fmt.Println("Error fetching champions: ", queryErr)
		return nil, queryErr
	}

	defer rows.Close()

	var champions []models.Champion

	for rows.Next() {
		var champion models.Champion
		scanErr := rows.Scan(&champion.ID, &champion.Name, &champion.Set, &champion.Cost, &champion.Range, &champion.Gender)

		if scanErr != nil {
			fmt.Println("Error scanning champion: ", scanErr)
			return nil, scanErr
		}

		champions = append(champions, champion)
	}

	return champions, nil
}

func InsertChampionImport(db *sql.DB, champion models.ChampionImport) error {
	query := `
		INSERT INTO champion (name, set, cost, range, gender)
		VALUES ($1, $2, $3, $4, $5) RETURNING id;
	`

	row := db.QueryRow(query,
		champion.Name,
		models.ParseChampionImportSet(champion.Set),
		champion.Cost,
		champion.Range,
		champion.Gender,
	)

	if row.Err() != nil {
		fmt.Println("Error inserting champion: ", champion, row.Err())
		return row.Err()
	}

	var championId string
	row.Scan(&championId)

	for _, traitName := range champion.Traits {
		trait, fetchErr := FindTraitByName(db, traitName)

		if fetchErr != nil {
			fmt.Println("Error inserting champion: ", champion, row.Err())
			return fetchErr
		}

		var targetTraitId string = trait.ID

		if trait.ID == "" {
			traitId, insertErr := InsertTrait(db, traitName)

			if insertErr != nil {
				fmt.Println("Error inserting champion: ", champion, row.Err())
				return insertErr
			}

			targetTraitId = traitId

			fmt.Println("Importet Trait: ", traitName)
		}

		insertErr := InsertChampionTrait(db, championId, targetTraitId)

		if insertErr != nil {
			fmt.Println("Error inserting champion: ", champion, row.Err())
			return insertErr
		}
	}

	return nil
}

func InsertChampionTrait(db *sql.DB, championId string, traitId string) error {
	query := `
		INSERT INTO champion_traits (champion_id, trait_id)
		VALUES ($1, $2);
	`

	_, err := db.Exec(query, championId, traitId)

	if err != nil {
		fmt.Println("Error inserting champion_traits: ", championId, traitId, err)
		return err
	}

	return nil
}

func RandomChampionId(db *sql.DB) (string, error) {
	row := db.QueryRow("SELECT id FROM champion ORDER BY RANDOM() LIMIT 1")

	var championId string
	err := row.Scan(&championId)

	if err != nil {
		fmt.Println("Error selecting random champion", err)
		return "", err
	}

	return championId, nil
}
