package models

import "time"

type Product struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       int       `json:"price"`
	Image_url   string    `json:"image"`
	CreatedAt   time.Time `json:"created_at"`
}
