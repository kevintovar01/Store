# Usa la imagen oficial de Node.js como base
FROM node:23

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package.json ./
COPY package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto que usará la aplicación
EXPOSE 5173

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"]
