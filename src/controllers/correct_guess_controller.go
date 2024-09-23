package controllers

import (
	"fmt"
	"net/http"
	"tftordle/src/database"
	"tftordle/src/models/responses"
	"tftordle/src/services"
	"tftordle/src/utils"
)

func InitCorrectGuessController(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "GET", "correct-guess", "count/{guessType}", CountCorrectGuessByType)
}

func CountCorrectGuessByType(w http.ResponseWriter, r *http.Request) {
	guessType := r.PathValue("guessType")

	if guessType != string(utils.CHAMPION) && guessType != string(utils.TRAIT) {
		utils.BadRequest(w, fmt.Sprintf("Invalid Guess Type provided: '%s'", guessType))
		return
	}

	db, dbErr := database.OpenConnection()

	if dbErr != nil {
		utils.UnexpectedError(w, dbErr)
		return
	}

	defer db.Close()

	count, err := services.CountCorrectGuessByType(db, utils.GuessType(guessType))

	if err != nil {
		utils.UnexpectedError(w, err)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, responses.CorrectGuessCountResponse{
		Count: count,
	})
}
