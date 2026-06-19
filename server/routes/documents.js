const express = require('express')
const { generate, download } = require('../controllers/documentController')

const router = express.Router()

router.post('/generate', generate)
router.get('/download/:filename', download)

module.exports = router
