const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 8080;
const multer = require('multer');

//Controllers.
const vehicleController = require(path.join(__dirname, './src/controllers/vehicleController.js'))
const rentController = require(path.join(__dirname, './src/controllers/rentController.js'))
const reportControler = require(path.join(__dirname, './src/controllers/reportController.js'))
const auth = require(path.join(__dirname, './src/middleware/auth.js'))
const validateQuery = require(path.join(__dirname, './src/middleware/validateQuery.js'))

const { initializeApp, initializeStorage } = require('./src/utils/firebase');
const { response } = require('express');

initializeApp();

const bucket = initializeStorage();

// Initiating a memory storage engine to store files as Buffer objects
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limiting files size to 5 MB
    },
});

app.use(cors({ origin: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

app.get('/ping', (req, res) => {
    res.status(200).send('pong')
})

app.get('/authPing', auth, (req, res) => {
    res.status(200).send('pong')
})

// PATH: VEHICLES
app.post('/vehicles',  // CREATE VEHICLE
    [check('vehicle', 'Debe ingresar un vehiculo').not().isEmpty(),
    check('vehicle.licensePlate', 'Debe ingresar una patente').not().isEmpty(),
    check('vehicle.category', 'Debe ingresar una categoría').not().isEmpty(),
    check('vehicle.price', 'Debe ingresar un precio').not().isEmpty(),
    check('vehicle.model', 'Debe ingresar un modelo').not().isEmpty(),
    check('vehicle.airport', 'Debe ingresar un aeropuerto').not().isEmpty(),
    check('vehicle.gearBox', 'Debe ingresar un tipo de caja').not().isEmpty(),
    check('vehicle.brand', 'Debe ingresar una marca').not().isEmpty(),
    check('vehicle.capacity', 'Debe ingresar la capacidad').not().isEmpty(),
    check('vehicle.doors', 'Debe ingresar la cantida de puertas').not().isEmpty(),
    check('vehicle.trunkCapacity', 'Debe ingresar la capacidad del baul').not().isEmpty(),
    check('vehicle.autonomy', 'Debe ingresar la autonomía').not().isEmpty()],
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

app.delete('/vehicles/:id', auth, (req, res) => { // DELETE VEHICLE
    vehicleController.deleteVehicle(req.params.id).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/vehicles', auth, (req, res) => { // GET ALL VEHICLES
    vehicleController.getVehicles().then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.get('/vehicles/:id', auth, (req, res) => { // GET ONE VEHICLE FROM ID    
    vehicleController.getVehicle(req.params.id).then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.get('/vehicles/airport/:id', validateQuery, auth, (req, res) => { // GET ALL VEHICLES FROM AIRPORT AND IT's rent status.
    vehicleController.getVehiclesFromAirport(req.params.id, req.query.from, req.query.to).then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.get('/vehicles/images/:id', auth, async (req, res) => { // GET VEHICLE IMAGE URL 
    try {
        const img = bucket.file(req.params.id)
        await img.getMetadata().then((data) => {
            res.status(200).send({ fileName: req.params.id, fileLocation: data[0].metadata.fileLocation });
        });
    }
    catch (error) {
        res.status(400).send(`No se ha podido obtener la imagen: ${error}`);
        return;
    }
})

app.post('/vehicles/images/:id', auth, uploader.single('image'), async (req, res, next) => { // POST VEHICLE IMAGE
    try {

        if (!req.file) {
            res.status(400).send('No se ha podido subir la imagen');
            return;
        }

        const fileName = req.params.id;
        const blob = bucket.file(fileName);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;

        const blobWriter = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
                metadata: { fileLocation: publicUrl }
            },
        });

        blobWriter.on('error', (err) => next(err));
        blobWriter.on('finish', () => {
            res.status(200).send({ fileName: fileName, fileLocation: publicUrl });
        });
        blobWriter.end(req.file.buffer);
    } catch (error) {
        res.status(400).send(`No se ha podido subir la imagen: ${error}`);
        return;
    }
});

app.post('/brands', [ // CREATE BRANDS
    check('brand', 'Debe ingresar una marca')
        .not()
        .isEmpty()
], (req, res) => {
    vehicleController.createBrand(req.body.brand).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/brands', auth, (req, res) => { // GET BRANDS
    vehicleController.getBrands().then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.post('/models', [ // CREATE MODELS
    check('model', 'Debe ingresar un modelo')
        .not()
        .isEmpty()
], (req, res) => {
    vehicleController.createModel(req.body.model).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
})

app.get('/models/:brand', auth, (req, res) => { // GET MODELS
    vehicleController.getModels(req.params.brand).then(
        (response) => {
            res.status(response.code).send(response);
        }
    );
})

app.post('/categories', [ // CREATE CATEGORY
    check('category', 'Debe ingresar una categoria')
        .not()
        .isEmpty()
], (req, res) => {
    vehicleController.createCategory(req.body.category).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
}
)

app.get('/categories', auth, (req, res) => { // GET CATEGORIES
    vehicleController.getCategories().then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

app.post('/extras', [ // CREATE EXTRA
    check('extra', 'Debe ingresar un extra')
        .not()
        .isEmpty()
], (req, res) => {
    vehicleController.createExtra(req.body.extra).then(
        (response) => {
            res.status(response.code).send(response)
        }
    )
}
)

app.get('/extras', auth, (req, res) => { // GET EXTRA
    vehicleController.getExtras().then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

// PATH: RENTS
app.post('/rents', auth, (req, res) => {
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

app.get('/rents', validateQuery, auth, (req, res) => { //GET ALL RENTS
    rentController.getRents(req.query.from, req.query.to).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

app.get('/rents/:id', auth, (req, res) => { //GET ONE RENT FROM ID
    rentController.getRent(req.params.id).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

app.delete('/rents/:id', auth, (req, res) => { //DELETE ONE RENT FROM ID
    rentController.deleteRent(req.params.id).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

app.put('/rents/:id', auth, (req, res) => { //EDIT ONE RENT FROM ID
    rentController.modifyRent(req.params.id, req.body).then(
        (response) => {
            res.status(response.code).send(response);
        }
    )
})

// PATH: REPORTS
app.get('/report', auth, (req, res) => { //GET REPORT
    reportControler.createReport(req.query.airport).then(
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