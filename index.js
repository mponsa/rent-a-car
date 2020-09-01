const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 8080;

//Controllers.
const vehicleController = require(path.join(__dirname,'./src/controllers/vehicleController.js'))

const { initializeApp  } = require('./src/utils/firebase');

initializeApp();

app.use(cors({ origin: true }));
app.use(express.json());


app.get('/', (req,res) => {
    res.status(200).send('Hello World!')
})

app.get('/ping', (req,res) => {
    res.status(200).send('pong')
})

app.post('/vehicles', (req,res) => {
    vehicleController.createVehicle(req.body).then(
        (response) => {
            res.status(response.code).send(response)
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