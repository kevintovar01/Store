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
	// Inicia el servidor en el puerto 5050
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
	// r es tu *mux.Router
	r.PathPrefix("/uploads/").Handler(
		http.StripPrefix("/uploads/",
			http.FileServer(http.Dir("./uploads"))),
	)

	// Le estamos diciendo a nuestro router, que para cada una de esas rutas use el middleware CheckAuthMiddleware
	r.Use(middleware.CheckAuthMiddleware(s))

	// url for the users
	r.HandleFunc("/", handlers.HomeHandler(s)).Methods(http.MethodGet)
	r.HandleFunc("/signup", handlers.SingUpHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/signupBusiness", handlers.InsertUserBusinessHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/login", handlers.LoginHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/me", handlers.MyHandler(s)).Methods(http.MethodGet)
	// url for the products
	r.HandleFunc("/products", middleware.RoleProxy([]string{"admin"}, s)(handlers.InsertProductHandler(s))).Methods(http.MethodPost)
	r.HandleFunc("/image/{id}", middleware.RoleProxy([]string{"admin"}, s)(handlers.InsertImageHandler(s))).Methods(http.MethodPost)
	r.HandleFunc("/products/{id}", middleware.RoleProxy([]string{"admin"}, s)(handlers.GetProductByIdHandler(s))).Methods(http.MethodGet)
	r.HandleFunc("/products/{id}", middleware.RoleProxy([]string{"admin"}, s)(handlers.UpdateProductHandler(s))).Methods(http.MethodPut)
	r.HandleFunc("/products/{id}", middleware.RoleProxy([]string{"admin"}, s)(handlers.DeleteProductHandler(s))).Methods(http.MethodDelete)
	r.HandleFunc("/products", handlers.ListProductHandler(s)).Methods(http.MethodGet)
	// urls for the carwish

	r.HandleFunc("/addItem/{id}", handlers.AddItemHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/wishcar", handlers.ListItemHandler(s)).Methods(http.MethodGet)
	r.HandleFunc("/wishcar/{id}", handlers.RemoveItemHandler(s)).Methods(http.MethodDelete)

	//roles urls
	r.HandleFunc("/createRole", middleware.RoleProxy([]string{"admin"}, s)(handlers.CreateRoleHandler(s))).Methods(http.MethodPost)
	r.HandleFunc("/listRoles", middleware.RoleProxy([]string{"admin"}, s)(handlers.ListRolesHandler(s))).Methods(http.MethodGet)
	r.HandleFunc("/getRole", handlers.GetRoleHandler(s)).Methods(http.MethodGet)
	r.HandleFunc("/setRole", handlers.SetRoleUserHandler(s)).Methods(http.MethodPost)
	r.HandleFunc("/getUserRoles", handlers.GetUserRolesHandler(s)).Methods(http.MethodGet)

	// el handler de websocket se encarga de manejar las conexiones de websocket
	r.HandleFunc("/ws", s.Hub().HandleWebSocket)

}

// "/wishcar/{id}", handlers.RemoveItemHandler(s) el id es el del producto
// "/wishcar/{id}", handlers.ListItemHandler(s) el id es el del carrito
//"/addItem/{id}", handlers.AddItemHandler(s) el id es el del producto
