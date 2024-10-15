package server

import (
	"fmt"
	"net/http"
	"tftordle/src/controllers"
	"tftordle/src/database"
	"tftordle/src/repositories"
	"tftordle/src/services"
	"tftordle/src/utils"
)

type Server struct {
	Port uint16
}

func (s *Server) Start() {
	db, championRepository, guessChampionRepository, correctGuessRepository, traitRepository := database.Initialize()

	defer db.Close()

	mux := http.NewServeMux()

	championGuessService, traitService := InitServices(championRepository, guessChampionRepository, correctGuessRepository, traitRepository)

	InitControllers(mux, championGuessService, traitService)

	utils.Log(fmt.Sprintf("Server started on Port %d", s.Port))
	http.ListenAndServe(fmt.Sprintf("localhost:%d", s.Port), mux)
}

func InitServices(championRepository repositories.ChampionRepository, guessChampionRepository repositories.GuessChampionRepository, correctGuessRepository repositories.CorrectGuessRepository, traitRepository repositories.TraitRepository) (services.ChampionGuessService, services.TraitGuessService) {
	championGuessService := services.ChampionGuessService{
		ChampionRepository:      championRepository,
		GuessChampionRepository: guessChampionRepository,
		CorrectGuessRepository:  correctGuessRepository,
	}

	traitService := services.TraitGuessService{
		TraitRepository: traitRepository,
	}

	return championGuessService, traitService
}

func InitControllers(mux *http.ServeMux, championGuessService services.ChampionGuessService, traitGuessService services.TraitGuessService) {
	championGuessController := controllers.ChampionGuessController{
		ChampionGuessService: championGuessService,
	}

	traitGuessController := controllers.TraitGuessController{
		TraitGuessService: traitGuessService,
	}

	championGuessController.Init(mux)
	traitGuessController.Init(mux)
}
