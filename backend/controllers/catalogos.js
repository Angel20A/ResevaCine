const { poolPromise } = require('../config/db');

const getCatalogos = async (req, res) => {
    try {
        const pool = await poolPromise;

        //obtiene todos los catalogos en una sola peticion
        const result = await pool.request().query(`
            SELECT IDestado, Nombre FROM Estado;
            SELECT IDtipopago, Nombre FROM TipoPago;
            SELECT IDcliente, Nombre, NIT FROM Cliente;
        `);

        res.json({
            estados: result.recordsets[0],
            tiposPago: result.recordsets[1],
            clientes: result.recordsets[2]
        });

    } catch (error) {
        console.error('Error al obtener catálogos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    getCatalogos
};