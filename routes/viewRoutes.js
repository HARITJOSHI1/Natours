const url = require('url');
const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController'); 


router.get('/', viewController.getOverView);
router.get('/tour/:slug', viewController.getTour);

module.exports = router;
