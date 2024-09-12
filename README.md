docker run -d --name tftordle -e POSTGRES_PASSWORD=postgres --publish 127.0.0.1:5432:5432/tcp postgres
go run src/main.go
