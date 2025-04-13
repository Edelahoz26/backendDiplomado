📦 Firebase Backend API
API REST construida con Node.js, Express y Firebase Admin SDK, que permite gestionar items autenticados mediante JWT.

📑 Características
Autenticación con Firebase y JWT.

Gestión de items (CRUD) mediante endpoints REST.

Documentación interactiva con Swagger.

Soporte para entornos de desarrollo y producción.

🛠️ Instalación
1️⃣ Clonar el repositorio
bash
Copiar
Editar
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio
2️⃣ Renombrar y configurar archivos
Renombra service-account-key.example.json a service-account-key.json

Renombra .env.example a .env y actualiza las variables necesarias.

3️⃣ Instalar dependencias
bash
Copiar
Editar
npm install
🚀 Comandos
🧑‍💻 Desarrollo
bash
Copiar
Editar
npm run dev
🚀 Producción
bash
Copiar
Editar
npm start
📖 Documentación
Una vez en ejecución, accede a la documentación Swagger desde:

bash
Copiar
Editar
http://localhost:3000/api-docs
🗂️ Estructura del Proyecto
pgsql
Copiar
Editar
📁 src
 ┣ 📁 config
 ┣ 📁 controllers
 ┣ 📁 middlewares
 ┣ 📁 models
 ┣ 📁 routes
 ┣ 📁 services
 ┣ 📄 app.js
 ┗ 📄 server.js
📄 .env
📄 package.json
📄 README.md
📄 service-account-key.json
🧩 Tecnologías Usadas
Node.js

Express

Firebase Admin SDK

JWT

Swagger

dotenv

📌 Notas
Asegúrate de tener las credenciales correctas en service-account-key.json.

Las variables de entorno deben estar configuradas en .env antes de iniciar.

📬 Contacto
Desarrollado por Edgardo De la Hoz
GitHub — LinkedIn