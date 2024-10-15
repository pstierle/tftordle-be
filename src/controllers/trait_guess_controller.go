package controllers

import (
	"net/http"
	"tftordle/src/models/responses"
	"tftordle/src/services"
	"tftordle/src/utils"
)

type TraitGuessController struct {
	TraitGuessService services.TraitGuessService
}

func (c *TraitGuessController) Init(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "GET", "trait-guess", "test", func(w http.ResponseWriter, r *http.Request) {
		Test(w, r, c)
	})
}

func Test(w http.ResponseWriter, r *http.Request, c *TraitGuessController) {
	utils.SendJsonResponse(w, http.StatusOK, responses.ChampionGuessStatClueResponse{
		Set:              "10",
		TraitsFirstChars: "todo!!",
	})
}
