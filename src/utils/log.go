package utils

import (
	"fmt"
	"time"
)

func Log(message string) {
	fmt.Println(fmt.Sprintf("%s %s", time.Now().UTC().Format("2006-01-02 15:04"), message))
}
