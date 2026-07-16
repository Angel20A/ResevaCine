const express = require('express');
const router = express.Router();
const { getCatalogos } = require('../controllers/catalogos');

router.get('/', getCatalogos);

module.exports = router;