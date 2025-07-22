# Etapa de construcción
FROM node:18 AS build

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine

# Copia los archivos construidos al directorio de Nginx
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]