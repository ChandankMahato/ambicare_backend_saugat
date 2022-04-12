const express = require('express');
const { userMiddleware } = require('../middleware/role');
const auth = require("../middleware/auth");
const { profile, signUp, signIn, signOut, updateName, updateNumber, setNewPassword, deleteAccount } 
= require('../controller/userController');
const router = express.Router();

router.get('/me', auth, userMiddleware, profile);

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', auth, signOut);

router.put('/update/name', auth, userMiddleware, updateName);
router.put('/update/phone', auth, userMiddleware, updateNumber);
router.put('/update/password', auth, userMiddleware, setNewPassword);

router.delete('/delete', auth, userMiddleware, deleteAccount);
module.exports = router;