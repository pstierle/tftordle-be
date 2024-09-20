package controllers

import (
	"fmt"
	"net/http"
	"tftordle/src/database"
	"tftordle/src/services"
	"tftordle/src/utils"
)

type CorrectGuessCountResponse struct {
	Count uint64 `json:"count"`
}

func InitCorrectGuessController(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "GET", "correct-guess", "count/{guessType}", CountCorrectGuessByType)
}

func CountCorrectGuessByType(w http.ResponseWriter, r *http.Request) {
	guessType := r.PathValue("guessType")

	if guessType != string(utils.CHAMPION) && guessType != string(utils.TRAIT) {
		http.Error(w, fmt.Sprintf("Invalid Guess Type provided: '%s'", guessType), http.StatusBadRequest)
	}

	db, dbErr := database.OpenConnection()

	if dbErr != nil {
		utils.UnexpectedError(w, dbErr)
	}

	defer db.Close()

	count, err := services.CountCorrectGuessByType(db, utils.GuessType(guessType))

	if err != nil {
		utils.UnexpectedError(w, err)
	}

	utils.SendJsonResponse(w, http.StatusOK, CorrectGuessCountResponse{
		Count: count,
	})
}
