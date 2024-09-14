package main

import (
	"fmt"
	"net/http"

	"tftordle/src/controllers"
	"tftordle/src/database"
)

func main() {
	database.Initialize()

	mux := http.NewServeMux()

	controllers.InitCorrectGuessController(mux)
	controllers.InitChampionGuessController(mux)

	http.ListenAndServe("localhost:8080", mux)

	fmt.Println("Server started")
}
