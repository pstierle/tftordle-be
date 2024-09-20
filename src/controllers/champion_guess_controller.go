package controllers

import (
	"encoding/json"
	"net/http"
	"tftordle/src/database"
	"tftordle/src/services"
	"tftordle/src/utils"
)

func InitChampionGuessController(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "GET", "champion-guess", "last", GetLastChampionGuess)
	/*
		@TODO implement Routes:
		POST /query-champions
		GET /stat-clue
		GET /icon-clue
		GET /check
	*/
}

func GetLastChampionGuess(w http.ResponseWriter, r *http.Request) {
	db, dbErr := database.OpenConnection()

	if dbErr != nil {
		utils.UnexpectedError(w, dbErr)
	}

	defer db.Close()

	guessChampion, err := services.FindGuessChampionByDate(db, utils.GuessChampionDateYesterday(), utils.CHAMPION)

	if err != nil {
		utils.UnexpectedError(w, err)
	}

	response, jsonErr := json.Marshal(guessChampion)

	if jsonErr != nil {
		utils.UnexpectedError(w, jsonErr)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, response)
}
