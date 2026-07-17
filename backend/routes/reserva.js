const { Router } = require('express');
const { crearReserva, actualizarEstadoReserva, getReservas } = require('../controllers/reserva');

const router = Router();

router.get('/', getReservas);
router.post('/', crearReserva);
router.patch('/estado/:id', actualizarEstadoReserva);

module.exports = router;
