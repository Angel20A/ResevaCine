const { Router } = require('express');
const { crearReserva, actualizarEstadoReserva, getReservas, getReporteTaquilla } = require('../controllers/reserva');

const router = Router();

router.get('/', getReservas);
router.post('/', crearReserva);
router.patch('/estado/:id', actualizarEstadoReserva);
router.get('/reporte', getReporteTaquilla);

module.exports = router;
