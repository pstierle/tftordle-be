package utils

import "time"

func GuessChampionDateToday() string {
	return time.Now().Format("02-01-2006")
}

func GuessChampionDateYesterday() string {
	return time.Now().AddDate(0, 0, -1).Format("02-01-2006")
}
