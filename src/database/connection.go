package database

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"tftordle/src/models"
	"tftordle/src/repositories"
	"tftordle/src/utils"

	"database/sql"

	_ "github.com/lib/pq"
	"github.com/robfig/cron/v3"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "postgres"
	dbname   = "postgres"
)

func OpenConnection() (*sql.DB, error) {
	connectionInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", connectionInfo)

	return db, err
}

func OpenDatabaseConnectionForHttp(w http.ResponseWriter) *sql.DB {
	conn, err := OpenConnection()

	if err != nil {
		utils.UnexpectedError(w, err)
	}

	return conn
}

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

func RunInitSql(db *sql.DB) {
	fmt.Println("Running init.sql ...")

	initSql, readErr := utils.ReadFile("src/database/init.sql")

	if readErr != nil {
		fmt.Println("Error reading init.sql: ", readErr)
		os.Exit(1)
	}

	_, sqlError := db.Exec(string(initSql))

	if sqlError != nil {
		fmt.Println("Error executing init.sql: ", sqlError)
		os.Exit(1)
	}
}

func RunMigrations(db *sql.DB) {
	fmt.Println("Running Migrations ...")

	migrationsPath := "src/database/migrations"

	files, readDirErr := os.ReadDir(migrationsPath)

	if readDirErr != nil {
		fmt.Println("Error reading mirgration files: ", readDirErr)
		os.Exit(1)
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if IsFileMigrated(file.Name(), db) {
			continue
		}

		filePath := fmt.Sprintf("%s/%s", migrationsPath, file.Name())

		sql, readErr := utils.ReadFile(filePath)

		if readErr != nil {
			fmt.Println("Error reading migration file: ", readErr)
		}

		MigrateFile(file.Name(), string(sql), db)
	}
}

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
	InitializeGuessChampionSync(db)

	fmt.Println("Initialized Database!")
}

func InitializeGuessChampionSync(db *sql.DB) {
	SyncGuessChampion(db, utils.CHAMPION)
	SyncGuessChampion(db, utils.TRAIT)

	c := cron.New()
	c.AddFunc("@every day", func() { SyncGuessChampion(db, utils.CHAMPION) })
	c.AddFunc("@every day", func() { SyncGuessChampion(db, utils.TRAIT) })
	c.Start()
}

func SyncGuessChampion(db *sql.DB, guessType utils.GuessType) {
	fmt.Println("Checking Guess Champion of Type", guessType)

	repositories.CreateGuessChampionIfNotExists(db, guessType, utils.GuessChampionDateToday())
	repositories.CreateGuessChampionIfNotExists(db, guessType, utils.GuessChampionDateYesterday())
}

func IsFileMigrated(fileName string, db *sql.DB) bool {
	result, err := db.Query(fmt.Sprintf("SELECT id FROM migration WHERE file_name = '%s'", fileName))

	if err != nil {
		fmt.Println("Error fetching migration: ", err)
		os.Exit(1)
	}

	return result.Next()
}

func MigrateFile(fileName string, migrationSql string, db *sql.DB) {
	insertMigrationSql := fmt.Sprintf("INSERT INTO migration (file_name, created_date) VALUES('%s', '%s');", fileName, time.Now().Format(time.RFC3339))

	sql := fmt.Sprintf("%s %s", insertMigrationSql, migrationSql)

	_, err := db.Exec(sql)

	if err != nil {
		fmt.Println("Error running migration:", err, fileName)
		os.Exit(1)
	}

	fmt.Println("Migration Sucessfull", fileName)
}
