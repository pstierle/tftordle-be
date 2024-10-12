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
	db, championRepository, guessChampionRepository, correctGuessRepository := database.Initialize()

	defer db.Close()

	mux := http.NewServeMux()

	championGuessService := InitServices(championRepository, guessChampionRepository, correctGuessRepository)

	InitControllers(mux, championGuessService)

	utils.Log(fmt.Sprintf("Server started on Port %d", s.Port))
	http.ListenAndServe(fmt.Sprintf("localhost:%d", s.Port), mux)
}

func InitServices(championRepository repositories.ChampionRepository, guessChampionRepository repositories.GuessChampionRepository, correctGuessRepository repositories.CorrectGuessRepository) services.ChampionGuessService {
	championGuessService := services.ChampionGuessService{
		ChampionRepository:      championRepository,
		GuessChampionRepository: guessChampionRepository,
		CorrectGuessRepository:  correctGuessRepository,
	}

	return championGuessService
}

func InitControllers(mux *http.ServeMux, championGuessService services.ChampionGuessService) {
	championGuessController := controllers.ChampionGuessController{
		ChampionGuessService: championGuessService,
	}

	championGuessController.Init(mux)
}
