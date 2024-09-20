package database

import (
	"fmt"
	"os"
	"tftordle/src/tasks"
)

func Initialize() {
	fmt.Println("Initializing Database ...")

	db, err := OpenConnection()

	if err != nil {
		fmt.Println("Failed to Connect to Database: ", err)
		os.Exit(1)
	}

	defer db.Close()

	RunInitSql(db)
	RunMigrations(db)
	ImportChampions(db)
	tasks.StartGuessChampionTask(db)

	fmt.Println("Initialized Database!")
}
