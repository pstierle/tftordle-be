package utils

import (
	"fmt"
	"io"
	"os"
	"time"
)

func ReadFile(path string) ([]byte, error) {
	file, openFileError := os.Open(path)

	if openFileError != nil {
		fmt.Println("Error opening file:", openFileError)
		return nil, openFileError
	}

	defer file.Close()

	content, readFileError := io.ReadAll(file)

	if readFileError != nil {
		fmt.Println("Error reading file:", readFileError)
		return nil, readFileError
	}

	return content, nil
}

func GuessChampionDateToday() string {
	return time.Now().Format("02-01-2006")
}

func GuessChampionDateYesterday() string {
	return time.Now().AddDate(0, 0, -1).Format("02-01-2006")
}
