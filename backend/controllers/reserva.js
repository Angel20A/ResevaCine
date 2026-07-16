const { poolPromise, sql } = require('../config/db');

const crearReserva = async (req, res) => {
    const { idFuncion, idTipoPago, idCliente, asientos } = req.body;

    if (!asientos || asientos.length === 0) {
        return res.status(400).json({ error: 'Debe enviar al menos un asiento.' });
    }

    // Espera el pool de conexiones
    const pool = await poolPromise;
    // Inicia la transacción
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Valida si la función existe y obtiene su Sala
        request.input('idFuncion', sql.Int, idFuncion);
        const funcionRes = await request.query(`
            SELECT IDsala FROM Funcion WHERE IDfuncion = @idFuncion
        `);
        if (funcionRes.recordset.length === 0) {
            throw new Error('La función solicitada no existe.');
        }
        const idSalaFuncion = funcionRes.recordset[0].IDsala;

        // Validar que los asientos existan y pertenezcan a la sala correcta
        const asientosList = asientos.join(',');
        const asientosRes = await request.query(`
            SELECT IDsala FROM Asiento WHERE IDasiento IN (${asientosList})
        `);
        if (asientosRes.recordset.length !== asientos.length) {
            throw new Error('Uno o más asientos enviados no existen.');
        }
        const salaIncorrecta = asientosRes.recordset.some(a => a.IDsala !== idSalaFuncion);
        if (salaIncorrecta) {
            throw new Error('Anomalía detectada: Hay asientos que no pertenecen a la sala de esta función.');
        }

        // Buscar si alguno de esos asientos ya está en un detalle de reserva para esta misma función.
        const concurrenciaRes = await request.query(`
            SELECT rd.IDasiento 
            FROM ReservaDetalle rd WITH (UPDLOCK)
            INNER JOIN Reserva r ON rd.IDreserva = r.IDreserva
            WHERE r.IDfuncion = @idFuncion 
            AND rd.IDasiento IN (${asientosList}) 
            AND r.IDestado IN (1, 2) -- 1: Reservada, 2: Confirmada
        `);
        if (concurrenciaRes.recordset.length > 0) {
            throw new Error('Condición de carrera: Uno o más asientos ya fueron reservados por otro cliente.');
        }

        // Si pasa todas las validaciones, reliza insercion de reserva
        request.input('idTipoPago', sql.Int, idTipoPago);
        request.input('idCliente', sql.Int, idCliente);

        const insertReserva = await request.query(`
            INSERT INTO Reserva (IDfuncion, IDtipopago, IDestado, IDcliente, Fecha)
            OUTPUT INSERTED.IDreserva
            VALUES (@idFuncion, @idTipoPago, 1, @idCliente, GETDATE())
        `);

        const nuevaReservaId = insertReserva.recordset[0].IDreserva;

        // inserta el Detalle de los asientos
        for (const idAsiento of asientos) {
            const detalleReq = new sql.Request(transaction);
            detalleReq.input('idReserva', sql.Int, nuevaReservaId);
            detalleReq.input('idAsiento', sql.Int, idAsiento);
            await detalleReq.query(`
                INSERT INTO ReservaDetalle (IDreserva, IDasiento)
                VALUES (@idReserva, @idAsiento)
            `);
        }

        // Se confirma la transacción en la base de datos
        await transaction.commit();

        res.status(200).json({
            mensaje: 'Reserva creada con éxito',
            idReserva: nuevaReservaId
        });

    } catch (error) {
        // Si algo falla, se realiza rollback
        if (transaction.isActive) {
            await transaction.rollback();
        }
        console.error('Error en transacción de reserva:', error.message);
        res.status(400).json({ error: error.message });
    }
};

const actualizarEstadoReserva = async (req, res) => {
    const { id } = req.params;
    const { idEstado } = req.body;

    if (!idEstado) {
        return res.status(400).json({ error: 'Debe proporcionar el nuevo idEstado.' });
    }

    try {
        const pool = await poolPromise;
        const request = pool.request();

        request.input('idReserva', sql.Int, id);
        request.input('idEstado', sql.Int, idEstado);

        // validar si la reserva existe y ejecutar el UPDATE
        const result = await request.query(`
            UPDATE Reserva 
            SET IDestado = @idEstado 
            WHERE IDreserva = @idReserva

            SELECT @@ROWCOUNT AS FilasAfectadas;
        `);

        if (result.recordset[0].FilasAfectadas === 0) {
            return res.status(404).json({ error: 'La reserva no existe.' });
        }

        res.json({ mensaje: 'Estado de la reserva actualizado correctamente.' });

    } catch (error) {
        console.error('Error al actualizar reserva:', error.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    crearReserva,
    actualizarEstadoReserva
};