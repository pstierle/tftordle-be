package services

import (
	"database/sql"
	"tftordle/src/models"
	"tftordle/src/models/requests"
	"tftordle/src/repositories"
)

func QueryChampions(db *sql.DB, filter requests.QueryRequest) ([]models.Champion, error) {
	return repositories.QueryChampions(db, filter)
}
