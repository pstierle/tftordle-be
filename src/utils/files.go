package utils

import (
	"fmt"
	"io"
	"os"
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
