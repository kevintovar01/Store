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
	PAGINATION_SIZE = 10
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

func (repo *PostgresRepository) InsertProduct(ctx context.Context, product *models.Product) error {
	log.Print(product)
	// execContext permite ejecutar codigo sql
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO products (id, name, price, user_id, description) VALUES ($1, $2, $3, $4, $5)",
		product.Id,
		product.Name,
		product.Price,
		product.User_id,
		product.Description)
	return err
}

func (repo *PostgresRepository) UpdateProduct(ctx context.Context, product *models.Product) error {
	_, err := repo.db.ExecContext(
		ctx,
		"UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4 and user_id = $5",
		product.Name,
		product.Description,
		product.Price,
		product.Id,
		product.User_id)
	return err
}

func (repo *PostgresRepository) DeleteProduct(ctx context.Context, id string, userId string) error {
	_, err := repo.db.ExecContext(ctx, "DELETE FROM products WHERE id = $1 and user_id = $2", id, userId)
	return err
}

func (repo *PostgresRepository) ListProduct(ctx context.Context, page uint64) ([]*models.Product, error) {
	// offset es la cantidad de registros que se saltara
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT id, name, price, user_id, description, created_at FROM products LIMIT $1 OFFSET $2",
		PAGINATION_SIZE, page*PAGINATION_SIZE)

	if err != nil {
		return nil, err
	}

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var products []*models.Product
	for rows.Next() {
		var product = models.Product{}
		if err = rows.Scan(
			&product.Id,
			&product.Name,
			&product.Price,
			&product.User_id,
			&product.Description,
			&product.CreatedAt); err == nil {
			products = append(products, &product)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

func (repo *PostgresRepository) GetProductById(ctx context.Context, id string) (*models.Product, error) {
	rows, err := repo.db.QueryContext(ctx, "SELECT id, name, price, user_id, description, created_at FROM products WHERE id = $1", id)
	log.Println(id)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var product = models.Product{}
	for rows.Next() {
		// toma rows he intenta mapear los valores de las columnas "SELECT id email FROM" dentro del modelo de datos de usuario.
		if err = rows.Scan(&product.Id, &product.Name, &product.Price, &product.User_id, &product.Description, &product.CreatedAt); err == nil { // parseo datos para se adaptados al modelo post
			return &product, nil
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &product, nil
}

func (repo *PostgresRepository) InsertImage(ctx context.Context, image *models.Image) (string, error) {
	var imageID string
	err := repo.db.QueryRowContext(
		ctx,
		"INSERT INTO images (user_id, url, name, type, size) VALUES ($1,$2,$3,$4,$5) RETURNING id",
		image.UserId,
		image.Url,
		image.Name,
		image.Type,
		image.Size).Scan(&imageID)
	return imageID, err
}

func (repo *PostgresRepository) LinkProductToImage(ctx context.Context, productID string, imageID string) error {
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO product_images (product_id, image_id) VALUES ($1, $2)",
		productID,
		imageID,
	)
	return err
}

func (repo *PostgresRepository) CreateWishCar(ctx context.Context, whishCar *models.Car) error {
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO wishcar (id, user_id, total) VALUES ($1, $2, $3) RETURNING id",
		whishCar.Id,
		whishCar.UserId,
		whishCar.Total)
	return err
}

func (repo *PostgresRepository) AddItem(ctx context.Context, carItem *models.CarItem) error {
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO car_item (car_id, product_id, quantity) VALUES ($1, $2, $3)",
		carItem.CarId,
		carItem.ProductId,
		carItem.Quantity)
	return err
}

func (repo *PostgresRepository) RemoveItem(ctx context.Context, productId string) error {
	_, err := repo.db.ExecContext(ctx, "DELETE FROM car_item WHERE product_id = $1", productId)
	return err
}

func (repo *PostgresRepository) UpdateQuantity(ctx context.Context, productId string, quantity int) error {
	_, err := repo.db.ExecContext(ctx, "UPDATE car_item SET quantity = quantity + $1 WHERE product_id = $2", quantity, productId)
	return err
}

func (repo *PostgresRepository) GetItem(ctx context.Context, productId string, carId string) (*models.CarItem, error) {
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT id, car_id, product_id, quantity FROM car_item WHERE product_id = $1 AND car_id = $2",
		productId,
		carId)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()
	var carItem = models.CarItem{}
	for rows.Next() {
		if err = rows.Scan(&carItem.Id, &carItem.CarId, &carItem.ProductId, &carItem.Quantity); err == nil {
			return &carItem, nil
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &carItem, nil
}

func (repo *PostgresRepository) GetWishCarById(ctx context.Context, userId string) (*models.Car, error) {
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT id, user_id, total, created_at FROM wishcar WHERE user_id = $1",
		userId)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var wishcar = models.Car{}
	for rows.Next() {
		if err = rows.Scan(&wishcar.Id, &wishcar.UserId, &wishcar.Total, &wishcar.CreatedAt); err == nil {
			return &wishcar, nil
		}

	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &wishcar, nil

}

func (repo *PostgresRepository) UpdateWishCar(ctx context.Context, wishCar *models.Car) error {
	_, err := repo.db.ExecContext(
		ctx,
		"UPDATE wishcar SET total = $1 WHERE id = $2",
		wishCar.Total,
		wishCar.Id)
	return err
}

func (repo *PostgresRepository) ListItems(ctx context.Context, carId string) ([]*models.CarItem, error) {
	// offset es la cantidad de registros que se saltara
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT id, car_id, product_id, quantity FROM car_item WHERE car_id = $1",
		carId)

	if err != nil {
		return nil, err
	}

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var carItems []*models.CarItem
	for rows.Next() {
		var carItem = models.CarItem{}
		if err = rows.Scan(
			&carItem.Id,
			&carItem.CarId,
			&carItem.ProductId,
			&carItem.Quantity); err == nil {
			carItems = append(carItems, &carItem)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return carItems, nil
}
