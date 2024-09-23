package main

import (
	"fmt"
	"net/http"

	"tftordle/src/controllers"
	"tftordle/src/database"
	"tftordle/src/utils"
)

func main() {
	database.Initialize()

	mux := http.NewServeMux()

	controllers.InitCorrectGuessController(mux)
	controllers.InitChampionGuessController(mux)
	controllers.InitChampionController(mux)

	utils.Log(fmt.Sprintf("Server started on Port %s", "8080"))
	http.ListenAndServe("localhost:8080", mux)
}
