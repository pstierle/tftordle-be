package models

type Champion struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Set    string `json:"set"`
	Cost   uint8  `json:"cost"`
	Range  uint8  `json:"range"`
	Gender string `json:"gender"`
}
