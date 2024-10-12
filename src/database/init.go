package database

import (
	"database/sql"
	"fmt"
	"os"
	"tftordle/src/repositories"
	"tftordle/src/tasks"
)

func Initialize() (*sql.DB, repositories.ChampionRepository, repositories.GuessChampionRepository, repositories.CorrectGuessRepository) {
	fmt.Println("Initializing Database ...")

	db, err := CreateConnection()

	if err != nil {
		fmt.Println("Failed to Connect to Database: ", err)
		os.Exit(1)
	}

	championRepository := repositories.ChampionRepository{
		Db: db,
	}

	guessChampionRepository := repositories.GuessChampionRepository{
		Db: db,
	}

	correctGuessRepository := repositories.CorrectGuessRepository{
		Db: db,
	}

	RunInitSql(db)
	RunMigrations(db)
	ImportChampions(db)

	tasks.StartGuessChampionTask(&guessChampionRepository)

	fmt.Println("Initialized Database!")

	return db, championRepository, guessChampionRepository, correctGuessRepository
}
