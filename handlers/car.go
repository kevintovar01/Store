package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kevintovar01/Store/middleware"
	"github.com/kevintovar01/Store/models"
	"github.com/kevintovar01/Store/repository"
	"github.com/kevintovar01/Store/server"
	"github.com/segmentio/ksuid"
)

type MessageResponse struct {
	Message string `json:"message"`
}

type CarResponse struct {
	Id    string  `json:"id"`
	Total float64 `json:"total"`
}

type QuantityRequest struct {
	Quantity int `json:"quantity"`
}

func GetInstanceCar(userId string, total float64, r *http.Request) (*models.Car, error) {

	car, err := repository.GetWishCarById(r.Context(), userId)
	if err != nil {
		return nil, err
	}
	if car.Id == "" {
		log.Println("se creo el carrito de compras solo uno")
		id, err := ksuid.NewRandom()
		if err != nil {
			return nil, err
		}

		car = models.NewCar(id.String(), userId, total)

		err = repository.CreateWishCar(r.Context(), car)
		if err != nil {
			return nil, err
		}
	}
	log.Println("el carrito de compras ya estaba creado")
	return car, nil
}

func CreateWishCarHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := middleware.TokenAuth(s, w, *r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claim, ok := token.Claims.(*models.AppClaims); ok && token.Valid {
			car, err := GetInstanceCar(claim.UserId, 0, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(&CarResponse{
				Id:    car.Id,
				Total: car.Total,
			})

		} else {
			http.Error(w, "invalid token", http.StatusInternalServerError)
			return
		}

	}
}

func GetWishCarByIdHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := middleware.TokenAuth(s, w, *r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claim, ok := token.Claims.(*models.AppClaims); ok && token.Valid {

			car, err := GetInstanceCar(claim.UserId, 0, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "aplication/json")
			json.NewEncoder(w).Encode(car)

		} else {
			http.Error(w, "invalid token", http.StatusInternalServerError)
			return
		}

	}
}

func AddItemHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		token, err := middleware.TokenAuth(s, w, *r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claim, ok := token.Claims.(*models.AppClaims); ok && token.Valid {

			var QuantityRequest *QuantityRequest
			if err := json.NewDecoder(r.Body).Decode(&QuantityRequest); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			builder := NewCarBuilder(claim.UserId, r)
			builder.LoadOrCreate()
			builder.AddProduct(params["id"], QuantityRequest.Quantity)
			builder.Build()

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(&MessageResponse{
				Message: "item added",
			})
		} else {

			http.Error(w, "invalid token", http.StatusInternalServerError)
			return

		}
	}
}
