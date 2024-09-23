package responses

import "tftordle/src/models"

type QueryChampionsResponse struct {
	Champions []models.Champion `json:"champions"`
}
