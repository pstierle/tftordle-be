package services

import (
	"tftordle/src/models"
	"tftordle/src/models/requests"
	"tftordle/src/repositories"
	"tftordle/src/utils"
)

type ChampionGuessService struct {
	ChampionRepository      repositories.ChampionRepository
	TraitRepository         repositories.TraitRepository
	GuessChampionRepository repositories.GuessChampionRepository
	CorrectGuessRepository  repositories.CorrectGuessRepository
}

func (s *ChampionGuessService) FindChampionsByFilter(filter requests.QueryRequest) ([]models.Champion, error) {
	return s.ChampionRepository.FindByFilter(filter)
}

func (s *ChampionGuessService) FindLastGuessChampion() (models.GuessChampion, error) {
	return s.GuessChampionRepository.FindByDateAndGuessType(utils.GuessChampionDateYesterday(), utils.CHAMPION)
}

func (s *ChampionGuessService) FindTodayGuessChampion() (models.GuessChampion, error) {
	return s.GuessChampionRepository.FindByDateAndGuessType(utils.GuessChampionDateToday(), utils.CHAMPION)
}

func (s *ChampionGuessService) CountCorrectGuess() (uint64, error) {
	return s.CorrectGuessRepository.CountByType(utils.CHAMPION)
}
