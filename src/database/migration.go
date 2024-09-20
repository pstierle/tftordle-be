package database

import (
	"database/sql"
	"fmt"
	"os"
	"tftordle/src/utils"
	"time"
)

func RunInitSql(db *sql.DB) {
	fmt.Println("Running init.sql ...")

	initSql, readErr := utils.ReadFile("src/database/migrations/init.sql")

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
