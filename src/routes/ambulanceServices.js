const express = require('express'); 
const auth = require("../middleware/auth")
const { serviceMiddleware } = require("../middleware/role")
const { signUp, signIn, signOut, profile, updateName, updateNumber, setNewPassword, deleteAccount } 
= require('../controller/ambulanceServiceController');
const router = express.Router();

router.get('/me', auth, profile);

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', auth, signOut);

router.put('/update/name', auth, serviceMiddleware, updateName);
router.put('/update/phone', auth, serviceMiddleware, updateNumber);
router.put('/update/password', auth, serviceMiddleware, setNewPassword);

router.delete('/delete', auth, serviceMiddleware, deleteAccount);

module.exports = router;