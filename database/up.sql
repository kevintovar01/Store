-- Habilitar la extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id VARCHAR(32) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TABLE IF EXISTS bussinessman;

CREATE TABLE bussinessman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(32) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- CREATE TABLE empresarios (
--     id VARCHAR(32) PRIMARY KEY,
--     user_id VARCHAR(32) UNIQUE NOT NULL,
--     company_name VARCHAR(255) NOT NULL,
--     company_address TEXT NOT NULL,
--     tax_id VARCHAR(50) UNIQUE NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

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
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


DROP TABLE IF EXISTS roles;

CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('admin');



DROP TABLE IF EXISTS users_roles;

CREATE TABLE users_roles(
    user_id VARCHAR(32) NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE 
);