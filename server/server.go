package server

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kevintovar01/Store/database"
	"github.com/kevintovar01/Store/repository"
)

type Config struct {
	Port        string
	JWTSecret   string //  secret key to generate tokens
	DatabaseUrl string // DB connection
}

type Server interface {
	Config() *Config
}

// broker encargado de manejar los servidores
type Broker struct {
	config *Config
	router *mux.Router // define las rutas de la API
}

func (b *Broker) Config() *Config {
	return b.config
}

func NewServer(ctx context.Context, config *Config) (*Broker, error) {

	// verification to fields are not empty
	if config.Port == "" {
		return nil, errors.New("port is required")
	}

	if config.JWTSecret == "" {
		return nil, errors.New("key secret is required")
	}

	if config.DatabaseUrl == "" {
		return nil, errors.New("db url is required")
	}

	broker := &Broker{
		config: config,
		router: mux.NewRouter(),
	}

	return broker, nil
}

func (b *Broker) Start(binder func(s Server, r *mux.Router)) {
	b.router = mux.NewRouter()
	binder(b, b.router)
	repo, err := database.NewPostgresRepository(b.config.DatabaseUrl)
	if err != nil {
		log.Fatal(err)
	}
	repository.SetRepository(repo)
	log.Println("Start server on port", b.Config().Port)
	if err := http.ListenAndServe(b.config.Port, b.router); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
