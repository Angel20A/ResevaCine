const { Router } = require('express');
const { getFunciones, getAsientosPorFuncion } = require('../controllers/funcion');

const router = Router();

router.get('/', getFunciones);

router.get('/:id/asientos', getAsientosPorFuncion);

module.exports = router;