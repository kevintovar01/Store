package models

import "time"

type Car struct {
	Id        string    `json:"id"`
	UserId    string    `json:"user_id"`
	Total     float64   `json:"total"`
	CreatedAt time.Time `json:"created_at"`
}

type CarItem struct {
	Id        string `json:"id"`
	CarId     string `json:"car_id"`
	ProductId string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

func NewCar(id string, userId string, total float64) *Car {
	return &Car{
		Id:     id,
		UserId: userId,
		Total:  total,
	}
}
