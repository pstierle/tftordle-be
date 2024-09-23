package controllers

import (
	"net/http"
	"tftordle/src/database"
	"tftordle/src/services"
	"tftordle/src/utils"
)

func InitChampionGuessController(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "GET", "champion-guess", "last", GetLastChampionGuess)
	/*
		@TODO implement Routes:
		GET /stat-clue
		GET /icon-clue
		GET /check
	*/
}

func GetLastChampionGuess(w http.ResponseWriter, r *http.Request) {
	db, dbErr := database.OpenConnection()

	if dbErr != nil {
		utils.UnexpectedError(w, dbErr)
		return
	}

	defer db.Close()

	guessChampion, err := services.FindGuessChampionByDate(db, utils.GuessChampionDateYesterday(), utils.CHAMPION)

	if err != nil {
		utils.UnexpectedError(w, err)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, guessChampion)
}
