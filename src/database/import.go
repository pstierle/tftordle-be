package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"tftordle/src/models"
	"tftordle/src/repositories"
	"tftordle/src/utils"
)

func ImportChampions(db *sql.DB) {
	championsContent, readErr := utils.ReadFile("src/database/imports/champions.json")

	if readErr != nil {
		fmt.Println("Error reading champions.json: ", readErr)
		os.Exit(1)
	}

	var importChampions []models.ChampionImport

	jsonErr := json.Unmarshal(championsContent, &importChampions)

	if jsonErr != nil {
		fmt.Println("Error unmarshalling champions.json: ", jsonErr)
		os.Exit(1)
	}

	champions, fetchErr := repositories.FindAllChampions(db)

	if fetchErr != nil {
		fmt.Println("Error fetching champions: ", fetchErr)
		os.Exit(1)
	}

	for _, importChampion := range importChampions {
		championImported := false

		for _, champion := range champions {
			if champion.Name == importChampion.Name && champion.Set == models.ParseChampionImportSet(importChampion.Set) {
				championImported = true
			}
		}

		if championImported {
			continue
		}

		repositories.InsertChampionImport(db, importChampion)

		fmt.Println("Importet Champion: ", importChampion.Name, importChampion.Set)
	}
}
