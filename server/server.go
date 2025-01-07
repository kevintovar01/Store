package server

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kevintovar01/Store/database"
	"github.com/kevintovar01/Store/repository"
	"github.com/kevintovar01/Store/websocket"
	"github.com/rs/cors"
)

type Config struct {
	Port        string
	JWTSecret   string //  secret key to generate tokens
	DatabaseUrl string // DB connection
}

type Server interface {
	Config() *Config
	Hub() *websocket.Hub
}

// broker encargado de manejar los servidores
type Broker struct {
	config *Config
	router *mux.Router // define las rutas de la API
	hub    *websocket.Hub
}

func (b *Broker) Config() *Config {
	return b.config
}

func (b *Broker) Hub() *websocket.Hub {
	return b.hub
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
		hub:    websocket.NewHub(),
	}

	return broker, nil
}

func (b *Broker) Start(binder func(s Server, r *mux.Router)) {
	// Crea un nuevo enrutador de mux
	b.router = mux.NewRouter()

	// Llama a la función binder para configurar las rutas del servidor
	binder(b, b.router)
	// con el handler pudemos conectarnos donde queramos.
	handler := cors.Default().Handler(b.router)
	// Crea un nuevo repositorio de PostgreSQL utilizando la URL de la base de datos de la configuración
	repo, err := database.NewPostgresRepository(b.config.DatabaseUrl)
	if err != nil {
		// Si hay un error al crear el repositorio, se registra y se termina el programa
		log.Fatal(err)
	}
	go b.hub.Run()
	// Establece el repositorio globalmente
	repository.SetRepository(repo)

	// Imprime un mensaje indicando que el servidor está iniciando en el puerto configurado
	log.Println("Start server on port", b.Config().Port)

	// Inicia el servidor HTTP en el puerto configurado y utiliza el enrutador configurado
	if err := http.ListenAndServe(b.config.Port, handler); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
