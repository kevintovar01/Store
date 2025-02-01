package repository

import (
	"context"

	"github.com/kevintovar01/Store/models"
)

type Repository interface {
	// Crud for User
	InsertUser(ctx context.Context, user *models.User) error
	GetUserById(ctx context.Context, id string) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)

	// Crud for product
	InsertProduct(ctx context.Context, product *models.Product) error
	GetProductById(ctx context.Context, id string) (*models.Product, error)
	UpdateProduct(ctx context.Context, product *models.Product) error
	DeleteProduct(ctx context.Context, id string, userId string) error
	ListProduct(ctx context.Context, page uint64) ([]*models.Product, error)
	InsertImage(ctx context.Context, image *models.Image) (string, error)
	LinkProductToImage(ctx context.Context, productID string, imageID string) error

	// Crud for wishcar
	CreateWishCar(ctx context.Context, wishCar *models.Car) error
	GetWishCarById(ctx context.Context, userId string) (*models.Car, error)
	UpdateWishCar(ctx context.Context, wishCar *models.Car) error
	AddItem(ctx context.Context, carItem *models.CarItem) error
	GetItem(ctx context.Context, productId string, carId string) (*models.CarItem, error)
	RemoveItem(ctx context.Context, productId string) error
	UpdateQuantity(ctx context.Context, productId string, quiantity int) error
	ListItems(ctx context.Context, carId string) ([]*models.CarItem, error)

	Close() error
}

var implementation Repository

func SetRepository(repository Repository) {
	implementation = repository
}

func InsertUser(ctx context.Context, user *models.User) error {
	return implementation.InsertUser(ctx, user)
}

func GetUserById(ctx context.Context, id string) (*models.User, error) {
	return implementation.GetUserById(ctx, id)
}

func GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return implementation.GetUserByEmail(ctx, email)
}

func InsertProduct(ctx context.Context, product *models.Product) error {
	return implementation.InsertProduct(ctx, product)
}

func GetProductById(ctx context.Context, id string) (*models.Product, error) {
	return implementation.GetProductById(ctx, id)
}

func UpdateProduct(ctx context.Context, product *models.Product) error {
	return implementation.UpdateProduct(ctx, product)
}

func ListProduct(ctx context.Context, page uint64) ([]*models.Product, error) {
	return implementation.ListProduct(ctx, page)
}

func DeleteProduct(ctx context.Context, id string, userId string) error {
	return implementation.DeleteProduct(ctx, id, userId)
}

func InsertImage(ctx context.Context, image *models.Image) (string, error) {
	return implementation.InsertImage(ctx, image)
}

func LinkProductToImage(ctx context.Context, productID string, imageID string) error {
	return implementation.LinkProductToImage(ctx, productID, imageID)
}

// functions from wishcar
func CreateWishCar(ctx context.Context, wishCar *models.Car) error {
	return implementation.CreateWishCar(ctx, wishCar)
}

func AddItem(ctx context.Context, carItem *models.CarItem) error {
	return implementation.AddItem(ctx, carItem)
}

func GetWishCarById(ctx context.Context, userId string) (*models.Car, error) {
	return implementation.GetWishCarById(ctx, userId)
}

func UpdateWishCar(ctx context.Context, wishCar *models.Car) error {
	return implementation.UpdateWishCar(ctx, wishCar)
}

func GetItem(ctx context.Context, productId string, carId string) (*models.CarItem, error) {
	return implementation.GetItem(ctx, productId, carId)
}

func RemoveItem(ctx context.Context, productId string) error {
	return implementation.RemoveItem(ctx, productId)
}

func UpdateQuantity(ctx context.Context, productId string, quantity int) error {
	return implementation.UpdateQuantity(ctx, productId, quantity)
}

func ListItems(ctx context.Context, carId string) ([]*models.CarItem, error) {
	return implementation.ListItems(ctx, carId)
}

func Close() error {
	return implementation.Close()
}
