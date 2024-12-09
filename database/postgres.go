package database

// implementacion concreta
import (
	"context"
	"database/sql"
	"log"

	"github.com/kevintovar01/Store/models"
	_ "github.com/lib/pq" // necesarion para que los drives de postgres funcionen.
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(url string) (*PostgresRepository, error) {
	db, err := sql.Open("postgres", url)
	if err != nil {
		return nil, err
	}
	return &PostgresRepository{db}, nil
}

func (repo *PostgresRepository) InsertUser(ctx context.Context, user *models.User) error {
	// execContext permite ejecutar codigo sql
	_, err := repo.db.ExecContext(ctx, "INSERT INTO users (email, password) VALUES ($1, $2)", user.Email, user.Password)
	return err
}

func (repo *PostgresRepository) GetUserById(ctx context.Context, id string) (*models.User, error) {
	rows, err := repo.db.QueryContext(ctx, "SELECT id email FROM users WHERE id = $1", id)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var user = models.User{}
	for rows.Next() {
		// toma rows he intenta mapear los valores de las columnas "SELECT id email FROM" dentro del modelo de datos de usuario.
		if err = rows.Scan(&user.Id, &user.Email); err == nil { // parseo datos para se adaptados al modelo user
			return &user, nil
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &user, nil

}

func (repo *PostgresRepository) Close() error {
	return repo.db.Close() // cierra conexion de la base de datos cuando se deja usar.
}
