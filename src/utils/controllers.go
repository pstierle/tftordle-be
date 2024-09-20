package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Request %s %s\n", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func UnexpectedError(w http.ResponseWriter, err error) {
	fmt.Println("Unexpected Error: ", err)
	http.Error(w, "Unexpected Internal Error", http.StatusInternalServerError)
}

func SetupControllerRoute(mux *http.ServeMux, method string, controllerPath string, routePath string, handler func(http.ResponseWriter, *http.Request)) {
	fullPath := fmt.Sprintf("%s /%s/%s", method, controllerPath, routePath)
	wrappedHandler := LoggingMiddleware(http.HandlerFunc(handler))
	mux.Handle(fullPath, wrappedHandler)
	fmt.Println("Added Route Handler: ", fullPath)
}

func SendJsonResponse(w http.ResponseWriter, status int, response any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(response)
}
