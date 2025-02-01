DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id VARCHAR(32) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS products;

CREATE TABLE products(
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    user_id VARCHAR(32) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


DROP TABLE IF EXISTS images;

-- Habilitar la extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE images(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Usar UUID para claves únicasa
    user_id  VARCHAR(32) NOT NULL,                        -- Usar UUID si la tabla users lo soporta
    url TEXT NOT NULL,                            -- Almacena la URL completa
    name VARCHAR(255),                            -- Nombre original del archivo
    type VARCHAR(50),                             -- Tipo MIME (ejemplo: image/jpeg)
    size BIGINT,                                  -- Tamaño en bytes
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),  -- Fecha de creación
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE        -- Eliminar imágenes al eliminar un usuario
);

-- Crear índices para consultas rápidas
CREATE INDEX idx_user_id ON images(user_id);


DROP TABLE IF EXISTS product_images;

CREATE TABLE product_images (
    product_id VARCHAR(32) NOT NULL,
    image_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,

    PRIMARY KEY (product_id, image_id)
);

DROP TABLE IF EXISTS wishcar; 

CREATE TABLE wishcar(
    id VARCHAR(32) PRIMARY KEY ,
    user_id VARCHAR(32) NOT NULL,
    total DECIMAL(10,2 ) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS car_item;


CREATE TABLE car_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id VARCHAR(32) NOT NULL,
    product_id VARCHAR(32) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (car_id) REFERENCES wishcar(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products ON DELETE CASCADE
);