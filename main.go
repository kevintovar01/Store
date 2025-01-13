package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/kevintovar01/Store/handlers"
	"github.com/kevintovar01/Store/middleware"
	"github.com/kevintovar01/Store/server"
)

func main() {

	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT := os.Getenv("PORT")
	JWT_SECRET := os.Getenv("JWT_SECRET")
	DATABASE_URL := os.Getenv("DATABASE_URL")

	s, err := server.NewServer(context.Background(), &server.Config{
		Port:        PORT,
		JWTSecret:   JWT_SECRET,
		DatabaseUrl: DATABASE_URL,
	})
	if err != nil {
		log.Fatal(err)
	}

	s.Start(BindRoutes)
}

func BindRoutes(s server.Server, r *mux.Router) {
	// api := r.PathPrefix("/api/v1").Subrouter()

	// Le estamos diciendo a nuestro router, que para cada una de esas rutas use el middleware CheckAuthMiddleware
	r.Use(middleware.CheckAuthMiddleware(s))

	r.HandleFunc("/", handlers.HomeHandler(s)).Methods(http.MethodGet)
	r.HandleFunc("/signup", handlers.SingUpHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/login", handlers.LoginHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/me", handlers.MyHandler(s)).Methods(http.MethodGet)
	r.HandleFunc("/products", handlers.InsertProductHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/image/{id}", handlers.InsertImageHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/products/{id}", handlers.GetProductByIdHandler(s)).Methods(http.MethodGet)
	r.HandleFunc("/products/{id}", handlers.UpdateProductHandler(s)).Methods(http.MethodPut)
	r.HandleFunc("/products/{id}", handlers.DeleteProductHandler(s)).Methods(http.MethodDelete)
	r.HandleFunc("/products", handlers.ListProductHandler(s)).Methods(http.MethodGet)
	// el handler de websocket se encarga de manejar las conexiones de websocket
	r.HandleFunc("/ws", s.Hub().HandleWebSocket)

}
