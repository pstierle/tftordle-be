package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"tftordle/src/models/requests"
	"tftordle/src/models/responses"
	"tftordle/src/services"
	"tftordle/src/utils"
)

type ChampionGuessController struct {
	ChampionGuessService services.ChampionGuessService
}

func (c *ChampionGuessController) Init(mux *http.ServeMux) {
	utils.SetupControllerRoute(mux, "GET", "champion-guess", "last", func(w http.ResponseWriter, r *http.Request) {
		GetLastChampionGuess(w, r, c)
	})
	utils.SetupControllerRoute(mux, "POST", "champion-guess", "query/champions", func(w http.ResponseWriter, r *http.Request) {
		QueryChampions(w, r, c)
	})
	utils.SetupControllerRoute(mux, "GET", "champion-guess", "correct-guess/count", func(w http.ResponseWriter, r *http.Request) {
		CountCorrectGuessByType(w, r, c)
	})
	utils.SetupControllerRoute(mux, "GET", "champion-guess", "stat-clue", func(w http.ResponseWriter, r *http.Request) {
		CountCorrectGuessByType(w, r, c)
	})
	/*
		@TODO implement Routes:
		GET /stat-clue
		GET /icon-clue
		GET /check
	*/
}

func GetChampionGuessStatClue(w http.ResponseWriter, r *http.Request, c *ChampionGuessController) {
	guessChampion, err := c.ChampionGuessService.FindTodayGuessChampion()

	if err != nil {
		utils.UnexpectedError(w, err)
		return
	}
    
    traits, err := c.ChampionGuessService.TraitRepository.FindTraitsByChampionId(guessChampion.ID)

	if err != nil {
		utils.UnexpectedError(w, err)
		return
	}  
    
    var traitsFirstChars []string

    for _, trait := range traits {
        traitsFirstChars = append(traitsFirstChars, string(trait.Name[0]))
    }

    utils.SendJsonResponse(w, http.StatusOK, responses.ChampionGuessStatClueResponse{
		Set:              guessChampion.Champion.Set,
		TraitsFirstChars: traitsFirstChars,
	})
}

func GetLastChampionGuess(w http.ResponseWriter, r *http.Request, c *ChampionGuessController) {
	guessChampion, err := c.ChampionGuessService.FindLastGuessChampion()

	if err != nil {
		utils.UnexpectedError(w, err)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, guessChampion)
}

func QueryChampions(w http.ResponseWriter, r *http.Request, c *ChampionGuessController) {
	decoder := json.NewDecoder(r.Body)

	var body requests.QueryRequest
	err := decoder.Decode(&body)

	if err != nil {
		utils.BadRequest(w, err.Error())
		return
	}

	for _, id := range body.ExcludeIds {
		if utils.IsValidUUID(id) == false {
			utils.BadRequest(w, fmt.Sprintf("'%s' is not a valid uuid", id))
			return
		}
	}

	champions, queryErr := c.ChampionGuessService.FindChampionsByFilter(body)

	if queryErr != nil {
		utils.UnexpectedError(w, queryErr)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, responses.QueryChampionsResponse{
		Champions: champions,
	})
}

func CountCorrectGuessByType(w http.ResponseWriter, r *http.Request, c *ChampionGuessController) {
	guessType := r.PathValue("guessType")

	if guessType != string(utils.CHAMPION) && guessType != string(utils.TRAIT) {
		utils.BadRequest(w, fmt.Sprintf("Invalid Guess Type provided: '%s'", guessType))
		return
	}

	count, err := c.ChampionGuessService.CountCorrectGuess()

	if err != nil {
		utils.UnexpectedError(w, err)
		return
	}

	utils.SendJsonResponse(w, http.StatusOK, responses.CorrectGuessCountResponse{
		Count: count,
	})
}
