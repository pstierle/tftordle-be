package utils

import (
	"fmt"
	"net/http"
)

func SetupControllerRoute(mux *http.ServeMux, method string, controllerPath string, routePath string, handler func(http.ResponseWriter, *http.Request)) {
	fullPath := fmt.Sprintf("%s /%s/%s", method, controllerPath, routePath)
	mux.HandleFunc(fullPath, handler)
	fmt.Println("Added Route Handler: ", fullPath)
}

func SendJsonResponse(w http.ResponseWriter, status int, response []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(response)
}
