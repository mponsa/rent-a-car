const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 8080;

//Controllers.
const vehicleController = require(path.join(__dirname, './src/controllers/vehicleController.js'))
const rentController = require(path.join(__dirname, './src/controllers/rentController.js'))
const auth = require(path.join(__dirname,'./src/middleware/auth.js'))

const { initializeApp } = require('./src/utils/firebase');
const { response } = require('express');

initializeApp();

app.use(cors({ origin: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

app.get('/ping', (req, res) => {
    res.status(200).send('pong')
})

app.get('/authPing', auth, (req,res) => {
    res.status(200).send('pong')
})

// PATH: VEHICLES
app.post('/vehicles',  // CREATE VEHICLE
    [check('vehicle', 'You must insert a vehicle').not().isEmpty()],
     auth,
    (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    vehicleController.createVehicle(req.body.vehicle).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.put('/vehicles/:id', [  // MODIFY VEHICLE
    check('vehicle', 'You must insert a vehicle')
        .not()
        .isEmpty()
], auth, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    vehicleController.updateVehicle(req.params.id, req.body.vehicle).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.delete('/vehicles/:id', auth, (req, res) => { //DELETE VEHICLE
    vehicleController.deleteVehicle(req.params.id).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})


app.get('/vehicles', (req, res) => { // GET ALL VEHICLES
    vehicleController.getVehicles().then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.get('/vehicles/:id', (req, res) => { // GET ONE VEHICLE FROM ID    
    vehicleController.getVehicle(req.params.id).then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.get('/vehicles/airport/:id', (req, res) => { // GET ALL VEHICLES FROM AIRPORT   
    vehicleController.getVehiclesFromAirport(req.params.id).then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

// PATH: RENT
app.post('/rent', [
    check('rent', 'Debe ingresar una renta')
        .not()
        .isEmpty()
], auth, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    rentController.createRent(req.body).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/rent/:from/:to', (req, res) => { //GET ALL RENT
    rentController.getRents(req.params.from, req.params.to).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

app.get('/rent/:id/:from/:to', (req, res) => { //GET ONE RENT FROM ID
    rentController.getRent(req.params.id, req.params.from, req.params.to).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

if (!module.parent) {
    const server = app.listen(process.env.PORT || 8080, () => {
        const { port } = server.address();
        console.log('Example app listening at http://localhost:%s', port);
    });
}

module.exports = app;