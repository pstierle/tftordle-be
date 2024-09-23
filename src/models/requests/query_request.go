package requests

type QueryRequest struct {
	Query      string   `json:"query"`
	ExcludeIds []string `json:"excludeIds"`
}
