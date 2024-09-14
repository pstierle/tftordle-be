package models

import "tftordle/src/utils"

type GuessChampion struct {
	ID         string
	Date       string
	GuessType  utils.GuessType
	ChampionId uint8
}
