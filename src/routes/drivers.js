const express = require('express');
const auth = require("../middleware/auth")
const { driverMiddleware, serviceMiddleware } = require("../middleware/role")
const { profile,signIn, signOut, updateName, updateNumber, setNewPassword, addDriver, updateAmbulanceDriver, updateAmbulance } 
= require('../controller/driverController');
const { deleteAccount } = require('../controller/driverController');
const router = express.Router();

router.get('/me', auth, profile);
router.post('/signin', signIn);
router.post('/signout', auth, signOut);

router.post('/add', auth, serviceMiddleware, addDriver);
router.put('/updateAmbulance', auth, driverMiddleware, updateAmbulance);
router.put('/update/name', auth, driverMiddleware, updateName);
router.put('/update/phone', auth, driverMiddleware, updateNumber);
router.put('/update/password', auth, driverMiddleware, setNewPassword);
router.put('/updateAmbulanceDriver', auth, driverMiddleware, updateAmbulanceDriver)

router.delete('/delete', auth, serviceMiddleware, deleteAccount);

module.exports = router;