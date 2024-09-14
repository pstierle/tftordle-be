package models

import "tftordle/src/utils"

type CorrectGuess struct {
	ID        string
	UserID    string
	date      string
	GuessType utils.GuessType
}
