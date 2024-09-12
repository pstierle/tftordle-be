package controllers

import (
	"fmt"
	"net/http"
)

func InitChampionGuessController(mux *http.ServeMux) {
	mux.HandleFunc("/champion-guess", handler)
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World")
}
