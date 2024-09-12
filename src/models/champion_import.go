package models

import (
	"fmt"
	"os"
	"strconv"
)

type ChampionImport struct {
	Name   string      `json:"name"`
	Set    interface{} `json:"set"`
	Cost   int         `json:"cost"`
	Range  int         `json:"range"`
	Gender string      `json:"gender"`
	Traits []string    `json:"traits"`
}

func ParseChampionImportSet(set interface{}) string {
	var championSet string

	switch v := set.(type) {
	case float64:
		if v == float64(int(v)) {
			championSet = strconv.Itoa(int(v))
		} else {
			championSet = fmt.Sprintf("%g", v)
		}
	case int:
		championSet = strconv.Itoa(v)
	default:
		championSet = ""
	}

	if championSet == "" {
		fmt.Println("Error parsing champion set: ", set)
		os.Exit(1)
	}

	return championSet
}
