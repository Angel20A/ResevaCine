const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
// app.get('/', (req, res) => {
//     res.send('API Taquilla - Activa');
// });

// Rutas
app.use('/api/reservas', require('./routes/reserva'));

app.use('/api/funciones', require('./routes/funcion'));

app.use('/api/catalogos', require('./routes/catalogos'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});