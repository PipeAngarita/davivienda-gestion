#  Gestor de Tareas Davivienda (Full-Stack)

Proyecto Full-Stack construido como prueba técnica, implementando un Tablero Kanban con funcionalidad de arrastrar y soltar (Drag and Drop) y autenticación JWT multi-rol.

##  Stack Tecnológico

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Backend** | Node.js (Express), TypeScript | Servidor REST API, Lógica de negocio, Autenticación JWT. |
| **Base de Datos** | PostgreSQL (Docker) | Persistencia de datos, gestión de tareas y usuarios. |
| **ORM** | Prisma | Cliente de base de datos ORM tipado. |
| **Frontend** | Next.js 14, TypeScript | Capa de presentación (React), App Router, State Management. |
| **Estilos** | Tailwind CSS | Framework de utilidades para diseño rápido y responsive. |
| **Kanban** | React DND | Implementación de la funcionalidad Drag and Drop. |

##  Requisitos Previos

Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/en/) (Versión 18+)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Para la base de datos PostgreSQL)

##  Instalación y Configuración (Paso a Paso)

Clona este repositorio y sigue estos pasos:

### 1. Configuración de la Base de Datos (PostgreSQL)

Desde el directorio raíz (`prueba_davivienda/`):

1.  **Levantar el Contenedor Docker:**
    ```bash
    docker-compose up -d
    ```
    Esto iniciará el servidor PostgreSQL en el puerto `5432`.

2.  **Configurar Variables de Entorno:**
    Asegúrate de que el archivo `.env` en la carpeta `backend/` contenga la siguiente URL de conexión:
    ```
    # backend/.env
    DATABASE_URL="postgresql://docker:docker@localhost:5432/davivienda_db?schema=public"
    ```

3.  **Migrar y Sembrar la Base de Datos:**
    ```bash
    cd backend
    npx prisma migrate dev --name init
    npm run seed
    ```
    Esto creará las tablas y poblará la base de datos con un usuario **Administrador** (`admin@demo.com`) y un proyecto de prueba.

### 2. Inicio del Backend

Desde la carpeta `backend/`:

```bash
npm install
npm run dev

El servidor de la API iniciará en http://localhost:4000

### 3. Inicio del Frontend
Desde la carpeta `frontend/`:

```bash
npm install
npm run dev

La aplicación web se abrirá en http://localhost:3000.

---

### 2.  Credenciales de Prueba

La tabla de credenciales debe ir al final, justo antes de cualquier sección de licenciamiento o contacto, para que sean fáciles de encontrar:

```markdown
##  Credenciales de Prueba

Utiliza las credenciales creadas por el *seed* para iniciar sesión:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@demo.com` | `Demo1234` |
| **Estándar** | `felipe@demo.com` | `Demo1234` |

