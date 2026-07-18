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

</br>

##  1. Configurar la base de datos
  1. Crear una base de datos vacía en la instancia de SQL Server (ejemplo: ReservaCine).
  2. Ejecutar el script de creación de tablas:
````
CREATE TABLE Estado (
    IDestado INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE TipoPago (
    IDtipopago INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Genero (
    IDgenero INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Clasificacion (
    IDclasificacion INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Cliente (
    IDcliente INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Apellido VARCHAR(150) NOT NULL,
    NIT VARCHAR(15) NULL
);

CREATE TABLE Sala (
    IDsala INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Capacidad INT NOT NULL
);

CREATE TABLE Pelicula (
    IDpelicula INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    Duracion INT NOT NULL,
    IDgenero INT NOT NULL,
    IDclasificacion INT NOT NULL,
    FOREIGN KEY (IDgenero) REFERENCES Genero(IDgenero),
    FOREIGN KEY (IDclasificacion) REFERENCES Clasificacion(IDclasificacion)
);

CREATE TABLE Asiento (
    IDasiento INT IDENTITY(1,1) PRIMARY KEY,
    IDsala INT NOT NULL,
    Codigo VARCHAR(10) NOT NULL,
    FOREIGN KEY (IDsala) REFERENCES Sala(IDsala),
    CONSTRAINT UQ_Sala_Asiento UNIQUE (IDsala, Codigo)
);

CREATE TABLE Funcion (
    IDfuncion INT IDENTITY(1,1) PRIMARY KEY,
    IDsala INT NOT NULL,
    IDpelicula INT NOT NULL,
    FechaHora DATETIME NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (IDsala) REFERENCES Sala(IDsala),
    FOREIGN KEY (IDpelicula) REFERENCES Pelicula(IDpelicula),
    CONSTRAINT CK_Funcion_Precio CHECK (Precio >= 0)
);

CREATE TABLE Reserva (
    IDreserva INT IDENTITY(1,1) PRIMARY KEY,
    IDfuncion INT NOT NULL,
    IDtipopago INT NOT NULL,
    IDestado INT NOT NULL,
    IDcliente INT NOT NULL,
    Fecha DATETIME DEFAULT GETDATE() NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (IDfuncion) REFERENCES Funcion(IDfuncion),
    FOREIGN KEY (IDtipopago) REFERENCES TipoPago(IDtipopago),
    FOREIGN KEY (IDestado) REFERENCES Estado(IDestado),
    FOREIGN KEY (IDcliente) REFERENCES Cliente(IDcliente),
    CONSTRAINT CK_Reserva_Total CHECK (Total >= 0)
);

CREATE TABLE ReservaDetalle (
    IDreservadetalle INT IDENTITY(1,1) PRIMARY KEY,
    IDreserva INT NOT NULL,
    IDasiento INT NOT NULL,
    FOREIGN KEY (IDreserva) REFERENCES Reserva(IDreserva),
    FOREIGN KEY (IDasiento) REFERENCES Asiento(IDasiento),
    CONSTRAINT UQ_Reserva_Asiento UNIQUE (IDreserva, IDasiento) -- un asiento no se repite dentro de la misma reserva
);
````

  3. (Opcional para probar) Ejecutar el script de datos de ejemplo, una sola vez y justo después del anterior:
````
INSERT INTO Genero (Nombre) VALUES ('Acción'), ('Animación'), ('Comedia'), ('Terror');

INSERT INTO Clasificacion (Nombre) VALUES ('A - Todo público'), ('B - Mayores de 12 años'), ('C - Mayores de 18 años');

INSERT INTO Estado (Nombre) VALUES ('Reservada'), ('Confirmada'), ('Cancelada'), ('Expirada'), ('Utilizada');

INSERT INTO TipoPago (Nombre) VALUES ('Efectivo'), ('Tarjeta');


INSERT INTO Cliente (Nombre, Apellido, NIT) VALUES
('Carlos', 'Ramírez', '123456-7'),
('María', 'López', '765432-1'),
('Luis', 'Gómez', '849382123');

INSERT INTO Sala (Nombre, Capacidad) VALUES
('Sala 1', 15),
('Sala 2', 15);

INSERT INTO Asiento (IDsala, Codigo) VALUES
(1, 'A1'), (1, 'A2'), (1, 'A3'), (1, 'A4'), (1, 'A5'),
(1, 'B1'), (1, 'B2'), (1, 'B3'), (1, 'B4'), (1, 'B5'),
(1, 'C1'), (1, 'C2'), (1, 'C3'), (1, 'C4'), (1, 'C5'),
(2, 'A1'), (2, 'A2'), (2, 'A3'), (2, 'A4'), (2, 'A5'),
(2, 'B1'), (2, 'B2'), (2, 'B3'), (2, 'B4'), (2, 'B5'),
(2, 'C1'), (2, 'C2'), (2, 'C3'), (2, 'C4'), (2, 'C5');

INSERT INTO Pelicula (Nombre, Duracion, IDgenero, IDclasificacion) VALUES
('Avengers: Endgame', 181, 1, 2),
('Shrek', 90, 2, 1),
('Rápidos y Furiosos', 143, 1, 2),
('Batman', 112, 1, 3);

INSERT INTO Funcion (IDsala, IDpelicula, FechaHora, Precio) VALUES
(1, 1, '2026-07-18 14:00', 35.00),
(1, 3, '2026-07-18 18:00', 38.00),
(2, 2, '2026-07-18 15:30', 30.00),
(2, 4, '2026-07-18 21:00', 32.00); 

INSERT INTO Reserva (IDfuncion, IDtipopago, IDestado, IDcliente, Fecha, Total) VALUES
(1, 1, 2, 1, GETDATE(), 70.00);
INSERT INTO ReservaDetalle (IDreserva, IDasiento) VALUES
(1, 1),
(1, 2);

INSERT INTO Reserva (IDfuncion, IDtipopago, IDestado, IDcliente, Fecha, Total) VALUES
(3, 2, 1, 2, GETDATE(), 30.00);
INSERT INTO ReservaDetalle (IDreserva, IDasiento) VALUES
(2, 16);
````

## 2. Creación de .env:
- En la carpeta /backend, crear un archivo .env y colocar lo siguiente (cambiar los datos de ejemplo por los reales):
```
# Usuario de SQL Server
DB_USER=sa

# Contraseña del usuario de SQL Server
DB_PASSWORD=

# Host donde corre SQL Server (ej. localhost)
DB_SERVER=localhost

# Nombre de la base de datos
DB_DATABASE=ReservaCine

# Puerto de SQL Server (por defecto 1433)
DB_PORT=1433

# Puerto donde correrá el servidor de la API
PORT=3000
```

## 3. Configuración de backend
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

## 4. Configuración del frontend
```
cd frontend
npm install
npm run dev
```
Por defecto, el frontend corre en http://localhost:5173 y espera que el backend
esté disponible en http://localhost:3000/api.

</br>
</br>

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

## Galería del proyecto
<img width="1919" height="1107" alt="image" src="https://github.com/user-attachments/assets/0e8cb127-a34b-4a37-a123-22c6dc4552cc" />
<img width="1919" height="1107" alt="image" src="https://github.com/user-attachments/assets/c226a9c7-4d05-4897-aefb-fd96d4afc98d" />
<img width="1919" height="1113" alt="image" src="https://github.com/user-attachments/assets/e957faa3-2404-423d-88c4-e9e0cb5f3771" />
<img width="1919" height="1104" alt="image" src="https://github.com/user-attachments/assets/fd3eec56-acf8-4741-a3eb-85dbae8408e0" />
<img width="1919" height="1108" alt="image" src="https://github.com/user-attachments/assets/624d8ccf-7b97-44c5-b94a-caa7ee879133" />
<img width="1919" height="1107" alt="image" src="https://github.com/user-attachments/assets/67c7fd59-f5d2-49f0-88c3-92da65dc9694" />



