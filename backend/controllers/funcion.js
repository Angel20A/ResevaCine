const { poolPromise, sql } = require('../config/db');

// Obtiene todas las funciones
const getFunciones = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                f.IDfuncion,
                f.FechaHora,
                p.Nombre AS Pelicula,
                p.Duracion,
                g.Nombre AS Genero,
                c.Nombre AS Clasificacion,
                s.Nombre AS Sala,
                s.Capacidad
            FROM Funcion f
            INNER JOIN Pelicula p ON f.IDpelicula = p.IDpelicula
            INNER JOIN Genero g ON p.IDgenero = g.IDgenero
            INNER JOIN Clasificacion c ON p.IDclasificacion = c.IDclasificacion
            INNER JOIN Sala s ON f.IDsala = s.IDsala
            ORDER BY f.FechaHora ASC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener funciones:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtiene el mapa de asientos con estado de ocupación para una función específica
const getAsientosPorFuncion = async (req, res) => {
    const { id } = req.params; //id de la función

    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('idFuncion', sql.Int, id);

        // Trae todos los asientos de la sala, y si tiene reserva activa para esta función, marca Ocupado = 1
        const result = await request.query(`
            SELECT 
                a.IDasiento,
                a.Codigo,
                CASE 
                    WHEN rd.IDreservadetalle IS NOT NULL THEN 1 
                    ELSE 0 
                END AS Ocupado
            FROM Asiento a
            INNER JOIN Funcion f ON a.IDsala = f.IDsala
            LEFT JOIN ReservaDetalle rd ON a.IDasiento = rd.IDasiento
            LEFT JOIN Reserva r ON rd.IDreserva = r.IDreserva 
                AND r.IDfuncion = f.IDfuncion 
                AND r.IDestado IN (1, 2) -- 1 = Reservada, 2 = Confirmada
            WHERE f.IDfuncion = @idFuncion
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No se encontraron asientos para esta función o la función no existe.' });
        }

        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener asientos de la función:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    getFunciones,
    getAsientosPorFuncion
};