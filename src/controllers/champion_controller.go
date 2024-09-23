package controllers

import (
	"encoding/json"
	"net/http"
	"tftordle/src/database"
	"tftordle/src/models/requests"
	"tftordle/src/models/responses"
	"tftordle/src/services"
	"tftordle/src/utils"
)

func InitChampionController(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "POST", "champion", "query", QueryChampions)
}

func QueryChampions(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)

	var body requests.QueryRequest
	err := decoder.Decode(&body)

	if err != nil {
		utils.BadRequest(w, err.Error())
		return
	}

	db, dbErr := database.OpenConnection()

	if dbErr != nil {
		utils.UnexpectedError(w, dbErr)
		return
	}

	defer db.Close()

	champions, queryErr := services.QueryChampions(db, body)

	if queryErr != nil {
		utils.UnexpectedError(w, queryErr)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, responses.QueryChampionsResponse{
		Champions: champions,
	})
}
