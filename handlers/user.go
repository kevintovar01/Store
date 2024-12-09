package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/kevintovar01/Store/models"
	"github.com/kevintovar01/Store/repository"
	"github.com/kevintovar01/Store/server"
	"github.com/segmentio/ksuid"
)

type SingUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SingUpResponse struct {
	Id    string `json:"id"`
	Email string `json:"email"`
}

func SingUpHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request = SingUpRequest{}
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		id, err := ksuid.NewRandom() // id aletorio.
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var user = models.User{
			Email: request.Email,
			Id:    id.String(),
		}

		err = repository.InsertUser(r.Context(), &user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-type", "application/json")
		json.NewEncoder(w).Encode(SingUpResponse{
			Id:    user.Id,
			Email: user.Email,
		})
	}
}
