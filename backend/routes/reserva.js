const { Router } = require('express');
const { crearReserva, actualizarEstadoReserva } = require('../controllers/reserva');

const router = Router();

router.post('/', crearReserva);

router.patch('/estado/:id', actualizarEstadoReserva);

module.exports = router;
