const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 8080;

//Controllers.
const vehicleController = require(path.join(__dirname,'./src/controllers/vehicleController.js'))
const rentController = require(path.join(__dirname, './src/controllers/rentController.js'))

const { initializeApp  } = require('./src/utils/firebase');
const { response } = require('express');

initializeApp();

app.use(cors({ origin: true }));
app.use(express.json());


app.get('/', (req,res) => {
    res.status(200).send('Hello World!')
})

app.get('/ping', (req,res) => {
    res.status(200).send('pong')
})

// PATH: VEHICLES
app.post('/vehicles', [
    check('vehicle', 'Debe ingresar un vehiculo')
      .not()
      .isEmpty()
  ], (req,res) => {
    vehicleController.createVehicle(req.body).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/vehicles', (req,res) => { // GET ALL VEHICLES
    vehicleController.getVehicles().then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.get('/vehicles/:id', (req,res) => { // GET ONE VEHICLE FROM ID    
    vehicleController.getVehicle(req.params.id).then(
        (response) => {
            res.status(response.code).send(response);
        }
    );        
})

app.post('/brands', [
    check('brand', 'Debe ingresar una marca')
      .not()
      .isEmpty()
  ], (req,res) => {
    vehicleController.createBrand(req.body.brand).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/brands', (req,res) => {
    vehicleController.getBrands().then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.post('/models', [
    check('model', 'Debe ingresar un modelo')
      .not()
      .isEmpty()
  ], (req,res) => {
    vehicleController.createModel(req.body.model).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/models', (req,res) => {
    vehicleController.getModels().then(
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
  ], (req,res) => {
    rentController.createRent(req.body).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/rent/:from/:to', (req,res) => { //GET ALL RENT
    rentController.getRents(req.params.from, req.params.to).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

app.get('/rent/:id/:from/:to', (req,res) => { //GET ONE RENT FROM ID
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