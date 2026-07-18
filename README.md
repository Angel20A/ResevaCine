# Reseva de boletos de cine
Mini-sistema de reserva de boletos de cine 

Permite a un cajero de taquilla consultar la cartelera, ver la disponibilidad de
asientos por función, crear reservas y gestionar el estado de cada una
(Reservada → Confirmada → Utilizada / Cancelada / Expirada).

## Stack tecnológico
  Backend: Node.js, Express, mssql (SQL Server)
  Frontend: Vue 3, Vite, Bootstrap 5, Axios
  Base de datos: SQL Server

## Requisitos previos
  - Node.js v18 o superior
  - Una instancia de SQL Server accesible (local o remota)

##  Configurar la base de datos
  1. Crear una base de datos vacía en la instancia de SQL Server (ejemplo: ReservaCine).
  2. Ejecutar el script de creación de tablas:

  3. (Opcional para probar) Ejecutar el script de datos de ejemplo, una sola vez y justo después del anterior:


## Configuración de backend
  En terminal:
  ```
cd backend
npm install
```
  Levanta el servidor:
```
npm run dev
```
La API quedará disponible en http://localhost:3000/api por ejemplo.

## Configuración del frontend
```
cd frontend
npm install
npm run dev
```
Por defecto, el frontend corre en http://localhost:5173 y espera que el backend
esté disponible en http://localhost:3000/api.

## Estructura del proyecto
```
ResevaCine/
├── backend/          # API REST (Express + SQL Server)
│   ├── config/        # Conexión a la base de datos
│   ├── controllers/   # Lógica de negocio
│   ├── routes/         # Definición de endpoints
│   └── .env
├── frontend/         # Interfaz de taquilla (Vue 3 + Vite)
│   ├── components/         # reutilizables o vistas secundarias.
│   ├── composables/         # scripts .js donde se consume la api
│   └── src/
```
