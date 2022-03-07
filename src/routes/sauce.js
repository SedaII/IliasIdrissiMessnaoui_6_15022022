const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const multer = require ('../../middleware/multer-config');

const sauceController = require('../controllers/sauce');


router.get('/', auth, sauceController.getAllSauces);
router.post('/', auth, multer, sauceController.addSauce);

router.get('/:id', auth, sauceController.getSauceById);
router.put('/:id', auth, multer, sauceController.updateSauce);
router.delete('/:id', auth, sauceController.deleteSauce);

router.post('/:id/like', auth, sauceController.sendLike);

module.exports = router;