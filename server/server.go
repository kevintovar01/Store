package server

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"
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
		return nil, errors.New("Port is required")
	}

	if config.JWTSecret == "" {
		return nil, errors.New("Key secret is required")
	}

	if config.DatabaseUrl == "" {
		return nil, errors.New("DB url is required")
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
	log.Println("Start server on port", b.Config().Port)
	if err := http.ListenAndServe(b.config.Port, b.router); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
