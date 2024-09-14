package models

import "tftordle/src/utils"

type GuessChampion struct {
	ID         string          `json:"id"`
	Date       string          `json:"date"`
	GuessType  utils.GuessType `json:"guessType"`
	ChampionId string          `json:"championId"`
	Champion   Champion        `json:"champion"`
}
