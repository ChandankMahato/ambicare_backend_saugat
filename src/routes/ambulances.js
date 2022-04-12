const express = require('express');
const { allAmbulances, addAmbulance, deleteAmbulance, particularAmbulance, ownedBy, changeAvailability, updateAmbulanceDetails } 
= require("../controller/ambulanceController");
const auth = require("../middleware/auth")
const { serviceMiddleware } = require("../middleware/role")
const router = express.Router();

router.get('/', auth, allAmbulances);
router.get('/:id', auth, particularAmbulance);
router.post('/add', auth, serviceMiddleware, addAmbulance);
router.put('/:id', auth, serviceMiddleware, updateAmbulanceDetails);
router.delete('/:id', auth, serviceMiddleware, deleteAmbulance);
router.get('/ownedby/:id', auth, serviceMiddleware, ownedBy);
router.put('/update/availability', auth, serviceMiddleware, changeAvailability);

module.exports = router; 