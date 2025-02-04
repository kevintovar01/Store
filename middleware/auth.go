package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/kevintovar01/Store/models"
	"github.com/kevintovar01/Store/repository"
	"github.com/kevintovar01/Store/server"
)

var (
	//rutas para indicar la middleware que no necesita autenticacion
	NOT_AUTH_NEEDED = []string{
		"signup",
		"signupBusiness",
		"login",
		"/",
	}
)

// se itera sobre las rutas que no necesitan autenticacion
func shouldCheckToken(route string) bool {
	for _, p := range NOT_AUTH_NEEDED {
		if strings.Contains(route, p) {
			return false
		}
	}
	return true
}

// CheckAuthMiddleware es un middleware que protege rutas específicas en la aplicación
// verificando la presencia y validez de un token de autenticación en las solicitudes HTTP.
// Si la ruta no requiere autenticación, la solicitud se procesa normalmente.
// Si la ruta requiere autenticación y el token es válido, la solicitud se procesa;
// de lo contrario, se responde con un error de autorización.
func CheckAuthMiddleware(s server.Server) func(h http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !shouldCheckToken(r.URL.Path) {
				// Entra cuando shouldCheckToken es falso
				// La ruta no está protegida, puede seguir (next) sin el token de autenticación
				next.ServeHTTP(w, r)
				return
			}

			_, err := TokenAuth(s, w, *r)
			// Si hay un error al parsear o validar el token, responde con un error de autorización
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			// Si el token es válido, continúa con la siguiente función en la cadena
			next.ServeHTTP(w, r)
		})
	}
}

// TokenAuth es una función auxiliar que se utiliza para extraer y validar un token de autenticación
func TokenAuth(s server.Server, w http.ResponseWriter, r http.Request) (*jwt.Token, error) {
	tokenString := strings.TrimSpace(r.Header.Get("Authorization"))
	if tokenString == "" {
		return nil, fmt.Errorf("authorization header missing")
	}

	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	// Intenta parsear y validar el token
	token, err := jwt.ParseWithClaims(tokenString, &models.AppClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Proporciona la clave secreta para validar el token
		return []byte(s.Config().JWTSecret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	return token, nil

}

// RoleProxy verifica si el usuario tiene el rol necesario antes de ejecutar el handler original.
func RoleProxy(allowedRoles []string, s server.Server) func(next http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			token, err := TokenAuth(s, w, *r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(*models.AppClaims)
			if !ok || !token.Valid {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}
			// Obtiene los roles del usuario desde la BD
			roles, err := repository.GetUserRoles(context.Background(), claims.UserId)
			if err != nil {
				http.Error(w, "Error retrieving user roles", http.StatusInternalServerError)
				return
			}

			log.Println(roles)

			roleMap := make(map[string]bool)
			for _, role := range roles {
				roleMap[strings.ToLower(role)] = true
			}

			for _, allowedRole := range allowedRoles {
				if roleMap[strings.ToLower(allowedRole)] {
					next(w, r)
					return
				}
			}

			http.Error(w, "Forbidden: insufficient privileges", http.StatusForbidden)

		}
	}
}
