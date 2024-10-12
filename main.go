package main

import (
	"tftordle/src/server"
)

func main() {
	server := server.Server{
		Port: 8080,
	}

	server.Start()
}
