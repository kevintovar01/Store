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
	PAGINATION_SIZE = 34
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

func (repo *PostgresRepository) ListProduct(ctx context.Context, page uint64) ([]*models.ProductList, error) {
	// offset es la cantidad de registros que se saltara
	rows, err := repo.db.QueryContext(
		ctx,
		`SELECT 
			p.id, 
			p.name, 
			p.price, 
			p.user_id, 
			p.description, 
			p.created_at,
			COALESCE(STRING_AGG(i.url, ', '), '/uploads/default/product.jpg') AS image_urls
		 FROM products p
		 LEFT JOIN product_images pi ON p.id = pi.product_id
		 LEFT JOIN images i ON pi.image_id = i.id
		 GROUP BY p.id
		 LIMIT $1 OFFSET $2`,
		PAGINATION_SIZE, page*PAGINATION_SIZE,
	)

	if err != nil {
		return nil, err
	}

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var products []*models.ProductList
	for rows.Next() {
		var product = models.ProductList{}
		if err = rows.Scan(
			&product.Id,
			&product.Name,
			&product.Price,
			&product.User_id,
			&product.Description,
			&product.CreatedAt,
			&product.Url); err == nil {

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
	log.Print("imagen creada", image)
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

func (repo *PostgresRepository) GetImageById(ctx context.Context, productId string) (*models.Image, error) {
	rows, err := repo.db.QueryContext(ctx, "SELECT product_id, image_id, created_at FROM product_images WHERE product_id = $1", productId)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var imageLink = models.ImageLink{}

	for rows.Next() {
		// toma rows he intenta mapear los valores de las columnas "SELECT id email FROM" dentro del modelo de datos de usuario.
		if err = rows.Scan(&imageLink.ProductId, &imageLink.ImageId, &imageLink.CreatedAt); err != nil { // parseo datos para se adaptados al modelo post
			return nil, err
		}

	}

	rows, err = repo.db.QueryContext(ctx, "SELECT user_id, url, name, type, size, created_at FROM images WHERE id = $1", imageLink.ImageId)

	var image = models.Image{}
	for rows.Next() {
		// toma rows he intenta mapear los valores de las columnas "SELECT id email FROM" dentro del modelo de datos de usuario.
		if err = rows.Scan(&image.UserId, &image.Url, &image.Name, &image.Type, &image.Size, &image.CreatedAt); err == nil { // parseo datos para se adaptados al modelo post
			return &image, nil
		}

	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &image, nil
}

func (repo *PostgresRepository) CreateWishCar(ctx context.Context, whishCar *models.Car) error {
	log.Println("CreateWishCar", whishCar)
	log.Println("carID", whishCar.Id)
	log.Println("userID:", whishCar.UserId)
	log.Println("total:", whishCar.Total)
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO wishcar (id, user_id, total) VALUES ($1, $2, $3)",
		whishCar.Id,
		whishCar.UserId,
		whishCar.Total)
	return err
}

func (repo *PostgresRepository) AddItem(ctx context.Context, carItem *models.CarItem) error {
	log.Println("AddItem", carItem)
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

func (repo *PostgresRepository) ListItems(ctx context.Context, userId string) ([]*models.CarItem, error) {
	// offset es la cantidad de registros que se saltara
	rows, err := repo.db.QueryContext(
		ctx,
		`SELECT ci.id, 
				ci.car_id, 
				ci.product_id, 
				ci.quantity
		   FROM car_item AS ci
		   JOIN wishcar AS w ON w.id = ci.car_id
		  WHERE w.user_id = $1`,
		userId,
	)

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
	log.Println("itemscar:", carItems)
	return carItems, nil
}

// roles

func (repo PostgresRepository) CreateRole(ctx context.Context, role *models.Role) error {
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO roles (name) VALUES ($1)",
		role.Name)
	return err
}

func (repo PostgresRepository) ListRoles(ctx context.Context) ([]*models.Role, error) {
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT id, name FROM roles")
	if err != nil {
		return nil, err
	}

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var roles []*models.Role
	for rows.Next() {
		var role = models.Role{}
		if err = rows.Scan(
			&role.Id,
			&role.Name); err == nil {
			roles = append(roles, &role)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

func (repo PostgresRepository) GetRole(ctx context.Context, name string) (*models.Role, error) {
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT id, name FROM roles WHERE name= $1",
		name)

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var role = models.Role{}
	for rows.Next() {
		if err = rows.Scan(&role.Id, &role.Name); err == nil {
			return &role, nil
		}

	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &role, nil
}

func (repo PostgresRepository) SetRoleUser(ctx context.Context, userId string, roleId int) error {
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO users_roles (user_id, role_id) VALUES ($1, $2)",
		userId,
		roleId,
	)
	return err
}

func (repo PostgresRepository) GetUserRoles(ctx context.Context, userId string) ([]string, error) {
	rows, err := repo.db.QueryContext(
		ctx,
		"SELECT r.name FROM users_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1",
		userId)
	if err != nil {
		return nil, err
	}

	defer func() {
		err = rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	var roles []string
	for rows.Next() {
		var roleName string
		if err := rows.Scan(&roleName); err != nil {
			return nil, err
		}
		roles = append(roles, roleName)
	}
	return roles, nil
}

func (repo PostgresRepository) InsertUserBusiness(ctx context.Context, bussinessman *models.Bussinessman) error {
	_, err := repo.db.ExecContext(
		ctx,
		"INSERT INTO bussinessman (user_id, company_name, company_id) VALUES ($1, $2, $3)",
		bussinessman.UserId,
		bussinessman.CompanyName,
		bussinessman.CompanyId)
	return err
}
