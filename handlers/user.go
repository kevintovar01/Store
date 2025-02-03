package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/kevintovar01/Store/middleware"
	"github.com/kevintovar01/Store/models"
	"github.com/kevintovar01/Store/repository"
	"github.com/kevintovar01/Store/server"
	"github.com/segmentio/ksuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	HASH_COST = 8
)

type SingUpLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SingUpResponse struct {
	Id    string `json:"id"`
	Email string `json:"email"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func SingUpHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request = SingUpLoginRequest{}
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), HASH_COST) // Encriptacion de password
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}

		id, err := ksuid.NewRandom() // id aletorio.
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		var user = models.User{
			Email:    request.Email,
			Password: string(hashedPassword),
			Id:       id.String(),
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

func LoginHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request = SingUpLoginRequest{}
		// Decodifica el cuerpo del request entrante y lo almacena en la estructura request
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Obtiene el usuario por email desde el repositorio
		user, err := repository.GetUserByEmail(r.Context(), request.Email)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Verifica si el usuario existe
		if user == nil {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		// Compara la contraseña proporcionada con la almacenada en la base de datos
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		// Crea los claims para el JWT
		claims := models.AppClaims{
			UserId: user.Id,
			StandardClaims: jwt.StandardClaims{
				// Establece la fecha de expiración del token a 2 dias desde el momento actual
				ExpiresAt: time.Now().Add(2 * time.Hour * 24).Unix(),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)           // Crea un nuevo token con los claims
		tokenString, err := token.SignedString([]byte(s.Config().JWTSecret)) // Firma el token con la clave secreta
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("content-type", "application/json")
		json.NewEncoder(w).Encode(LoginResponse{
			Token: tokenString,
		})

	}
}

func MyHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := middleware.TokenAuth(s, w, *r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(*models.AppClaims); ok && token.Valid {
			user, err := repository.GetUserById(r.Context(), claims.UserId)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("content-type", "application/json")
			json.NewEncoder(w).Encode(user)

		} else {
			http.Error(w, "invalid token", http.StatusInternalServerError)
			return
		}
	}
}
