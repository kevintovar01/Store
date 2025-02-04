package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/kevintovar01/Store/middleware"
	"github.com/kevintovar01/Store/models"
	"github.com/kevintovar01/Store/repository"
	"github.com/kevintovar01/Store/server"
	"github.com/segmentio/ksuid"
)

type UpsertProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       string  `json:"stock"`
}

type ProductUpdateResponse struct {
	Message string `json:"message"`
}

type ProductResponse struct {
	Id    string  `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock string  `json:"stock"`
}

type GetProductResponse struct {
	Id          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       string    `json:"stock"`
	User_id     string    `json:"user_id"`
	CreatedAt   time.Time `json:"created_at"`
	Url         string    `json:"url"`
}

func InsertProductHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := middleware.TokenAuth(s, w, *r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claim, ok := token.Claims.(*models.AppClaims); ok && token.Valid {
			var productRequest = UpsertProductRequest{}
			if err := json.NewDecoder(r.Body).Decode(&productRequest); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			id, err := ksuid.NewRandom()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			product := models.Product{
				Id:          id.String(),
				Name:        productRequest.Name,
				Description: productRequest.Description,
				Price:       productRequest.Price,
				Stock:       productRequest.Stock,
				User_id:     claim.UserId,
			}

			err = repository.InsertProduct(r.Context(), &product)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			var productMessage = models.WebsocketMessage{
				Type:    "Product created",
				Payload: &product,
			}
			s.Hub().Broadcast(productMessage, nil)

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(&ProductResponse{
				Id:    id.String(),
				Name:  productRequest.Name,
				Price: productRequest.Price,
				Stock: productRequest.Stock,
			})
		} else {
			http.Error(w, "invalid token", http.StatusInternalServerError)
			return
		}
	}
}

func UpdateProductHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := middleware.TokenAuth(s, w, *r)
		params := mux.Vars(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claim, ok := token.Claims.(*models.AppClaims); ok && token.Valid {
			var productRequest = UpsertProductRequest{}
			if err := json.NewDecoder(r.Body).Decode(&productRequest); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			product := models.Product{
				Id:          params["id"],
				Name:        productRequest.Name,
				Description: productRequest.Description,
				Price:       productRequest.Price,
				Stock:       productRequest.Stock,
				User_id:     claim.UserId,
			}

			err = repository.UpdateProduct(r.Context(), &product)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			var productMessage = models.WebsocketMessage{
				Type:    "Product created",
				Payload: &product,
			}
			s.Hub().Broadcast(productMessage, nil)

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(&ProductUpdateResponse{
				Message: "Product updated",
			})
		} else {
			http.Error(w, "invalid token", http.StatusInternalServerError)
			return
		}
	}
}

func GetProductByIdHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		log.Println(params["id"])
		product, err := repository.GetProductById(r.Context(), params["id"])
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "aplication/json")
		json.NewEncoder(w).Encode(&GetProductResponse{
			Id:          product.Id,
			Name:        product.Name,
			Description: product.Description,
			Price:       product.Price,
			Stock:       product.Stock,
			User_id:     product.User_id,
			CreatedAt:   product.CreatedAt,
			Url:         product.Url})
	}
}

func DeleteProductHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := middleware.TokenAuth(s, w, *r)
		params := mux.Vars(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(*models.AppClaims); ok && token.Valid {
			err := repository.DeleteProduct(r.Context(), params["id"], claims.UserId)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("content-Type", "aplication/json")
			json.NewEncoder(w).Encode(&ProductUpdateResponse{
				Message: "Product deleted",
			})
		} else {
			http.Error(w, "Invalid token", http.StatusInternalServerError)
			return
		}

	}
}

func ListProductHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var err error
		pageStr := r.URL.Query().Get("page")
		var page = uint64(0)
		if pageStr != "" {
			page, err = strconv.ParseUint(pageStr, 10, 64)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
		}
		product, err := repository.ListProduct(r.Context(), page)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// w.header nos permite enviar una cabecera en la respuesta
		//content-type es el tipo de contenido que se esta enviando
		//application/json es el tipo de contenido que se esta enviando
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(product)
	}
}

func InsertImageHandler(s server.Server) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		params := mux.Vars(r)
		token, err := middleware.TokenAuth(s, w, *r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(*models.AppClaims); ok && token.Valid {
			file, header, err := r.FormFile("image")
			if err != nil {
				http.Error(w, "Error with the file", http.StatusBadRequest)
				return
			}
			defer file.Close()

			// guardar ruta en el servidor
			now := time.Now()
			folderPath := fmt.Sprintf("./uploads/%d/%02d/%02d", now.Year(), now.Month(), now.Day())
			err = os.MkdirAll(folderPath, os.ModePerm)
			if err != nil {
				http.Error(w, "Error to create de folder", http.StatusInternalServerError)
				return
			}

			filePath := filepath.Join(folderPath, header.Filename)
			destFile, err := os.Create(filePath)
			if err != nil {
				http.Error(w, "Error to save the file", http.StatusInternalServerError)
				return
			}

			defer destFile.Close()

			_, err = io.Copy(destFile, file)
			if err != nil {
				http.Error(w, "Error to copy the file", http.StatusInternalServerError)
				return
			}

			url := fmt.Sprintf("/uploads/%d/%02d/%02d/%s", now.Year(), now.Month(), now.Day(), header.Filename)
			image := models.Image{
				UserId: claims.UserId,
				Url:    url,
				Name:   header.Filename,
				Type:   header.Header.Get("Content-Type"),
				Size:   header.Size,
			}

			log.Println(image)

			imageID, err := repository.InsertImage(r.Context(), &image)
			if err != nil {
				http.Error(w, "Error to upload the image", http.StatusInternalServerError)
				return
			}

			err = repository.LinkProductToImage(r.Context(), params["id"], imageID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(&ProductUpdateResponse{
				Message: "Image upload",
			})
		} else {
			http.Error(w, "invalid token", http.StatusInternalServerError)
		}
	}
}
