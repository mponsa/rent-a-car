const admin = require('firebase-admin');

let vehicle = {
    id: 0,
    category: '',
    model: '',
    brand: '',
    doors: 0,
    capacity: 0,
    trunkCapacity: 0,
    autonomy: 0,
    gearBox: '',
    url: '',
    price: 0,
    extras: [],
    rented: false,
    nextAvailability: null,
    airport: 0
}

const createVehicle = async (body) => {
    try{
        let vehicle = validateModel(body)
        let id = await storeVehicle(vehicle)
        
        let msg = `Succesfully created vehicle`
        console.log(msg)
        return ({msg, id, code:200})
    }catch(error){
        let msg = `Error while creating vehicle: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const validateModel = (body) => {    
    return body;
}  

const storeVehicle = async (vehicle) => {
    if(!vehicle.id){
        console.log(`Creating vehicle...`)
        let id = await admin.firestore().collection('vehicles').add(vehicle)
        return id;
    }
}

const getVehicles = async () => {
    try {
        let vehicles = [];
        vehicles = (await admin.firestore().collection('vehicles').get())._docs().map((doc) => doc.data());
        return ({vehicles, code:200});
    }
    catch(error) {
        let msg = `Error while getting all vehicles`;
        console.log(msg);
        return ({msg, code: 500});
    }
}

const getVehicle = async (id) => {
    try {
        let vehicle = {};
        vehicle = (await admin.firestore().collection('vehicles').doc(id).get()).data();
        return ({vehicle, code:200});
    }
    catch(error) {
        let msg = `Error while getting vehicle: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

module.exports = { createVehicle, getVehicles, getVehicle }