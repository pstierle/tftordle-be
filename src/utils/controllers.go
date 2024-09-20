package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func UnexpectedError(w http.ResponseWriter, err error) {
	fmt.Println("Unexpected Error: ", err)
	http.Error(w, "Unexpected Internal Error", http.StatusInternalServerError)
}

func SetupControllerRoute(mux *http.ServeMux, method string, controllerPath string, routePath string, handler func(http.ResponseWriter, *http.Request)) {
	fullPath := fmt.Sprintf("%s /%s/%s", method, controllerPath, routePath)
	mux.HandleFunc(fullPath, handler)
	fmt.Println("Added Route Handler: ", fullPath)
}

func SendJsonResponse(w http.ResponseWriter, status int, response any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	err := json.NewEncoder(w).Encode(response)

	if err != nil {
		UnexpectedError(w, err)
	}
}
