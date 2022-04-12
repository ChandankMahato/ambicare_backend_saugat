const express = require('express');
const auth = require("../middleware/auth")
const { userMiddleware } = require("../middleware/role")
const { allRequests, addRequest, updateRequest, deleteRequest, particularRequest } = require("../controller/requestController");
const router = express.Router();

router.get('/', auth, allRequests);
router.get('/:id', auth, particularRequest);
router.post('/add', auth, userMiddleware, addRequest);
router.put('/:id', auth, userMiddleware, updateRequest);
router.delete('/:id', auth, deleteRequest);

module.exports = router; 