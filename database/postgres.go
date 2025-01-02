package database

// implementacion concreta
import (
	"context"
	"database/sql"
	"log"

	"github.com/kevintovar01/Store/models"
	_ "github.com/lib/pq" // necesarion para que los drives de postgres funcionen.
)

const (
	PAGINATION_SIZE = 2
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
	_, err := repo.db.ExecContext(ctx, "INSERT INTO users (id, email, password) VALUES ($1, $2, $3)", user.Id, user.Email, user.Password)
	return err
}

func (repo *PostgresRepository) GetUserById(ctx context.Context, id string) (*models.User, error) {
	rows, err := repo.db.QueryContext(ctx, "SELECT id, email FROM users WHERE id = $1", id)

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
			log.Println(user)
			return &user, nil
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	log.Println(id)

	return &user, nil

}

func (repo *PostgresRepository) Close() error {
	return repo.db.Close() // cierra conexion de la base de datos cuando se deja usar.
}

func (repo *PostgresRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	rows, err := repo.db.QueryContext(ctx, "SELECT id, email, password FROM users WHERE email = $1", email)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var user = models.User{}
	for rows.Next() {
		// toma rows he intenta mapear los valores de las columnas "SELECT id email FROM" dentro del modelo de datos de usuario.
		if err = rows.Scan(&user.Id, &user.Email, &user.Password); err == nil { // parseo datos para ser adaptados al modelo user
			return &user, nil
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &user, nil

}

func (repo *PostgresRepository) InsertPost(ctx context.Context, post *models.Post) error {
	// Log para depuración
	log.Println("Inserting post:", post)

	// Ejecuta la consulta de inserción
	result, err := repo.db.ExecContext(ctx, "INSERT INTO posts (id, post_content, user_id) VALUES ($1, $2, $3)", post.Id, post.PostContent, post.UserId)
	if err != nil {
		log.Println("Error inserting post:", err)
		return err
	}

	// Verifica cuántas filas fueron afectadas
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Println("Error getting rows affected:", err)
		return err
	}

	log.Println("Rows affected:", rowsAffected)
	return nil
}

func (repo *PostgresRepository) GetPostById(ctx context.Context, id string) (*models.Post, error) {
	rows, err := repo.db.QueryContext(ctx, "SELECT id, post_content, created_at, user_id FROM posts WHERE id = $1", id)
	log.Println(id)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var post = models.Post{}
	for rows.Next() {
		// toma rows he intenta mapear los valores de las columnas "SELECT id email FROM" dentro del modelo de datos de usuario.
		if err = rows.Scan(&post.Id, &post.PostContent, &post.CreatedAt, &post.UserId); err == nil { // parseo datos para se adaptados al modelo post
			return &post, nil
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &post, nil

}

func (repo *PostgresRepository) UpdatePost(ctx context.Context, post *models.Post) error {
	_, err := repo.db.ExecContext(ctx, "UPDATE posts SET post_content = $1 WHERE id = $2 and user_id = $3", post.PostContent, post.Id, post.UserId)
	return err
}

func (repo *PostgresRepository) DeletePost(ctx context.Context, id string, userId string) error {
	_, err := repo.db.ExecContext(ctx, "DELETE FROM posts WHERE id = $1 and user_id = $2", id, userId)
	return err
}

func (repo *PostgresRepository) ListPost(ctx context.Context, page uint64) ([]*models.Post, error) {
	// offset es la cantidad de registros que se saltara
	rows, err := repo.db.QueryContext(ctx, "SELECT id, post_content, user_id, created_at FROM posts LIMIT $1 OFFSET $2", PAGINATION_SIZE, page*PAGINATION_SIZE)
	if err != nil {
		return nil, err
	}

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var posts []*models.Post
	for rows.Next() {
		var post = models.Post{}
		if err = rows.Scan(&post.Id, &post.PostContent, &post.UserId, &post.CreatedAt); err == nil {
			posts = append(posts, &post)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func (repo *PostgresRepository) InsertProduct(ctx context.Context, product *models.Product) error {
	// execContext permite ejecutar codigo sql
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO products (id, name, price, image_url, description ) VALUES ($1, $2, $3, $4, $5)",
		product.Id,
		product.Name,
		product.Price,
		product.Image_url,
		product.Description)
	return err
}
