package main

import (
	"fmt"
	"net/http"

	"tftordle/src/controllers"
	"tftordle/src/database"
	"tftordle/src/models"
)

func main() {

	trait := &models.Trait{
		ID:   "1",
		Name: "bla",
	}

	fmt.Println("Trait:", trait)

	database.Initialize()

	mux := http.NewServeMux()

	controllers.InitChampionGuessController(mux)

	http.ListenAndServe("localhost:8080", mux)
}
