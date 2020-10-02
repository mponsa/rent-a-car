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
    try {
        let vehicle = validateModel(body)
        let id = await storeVehicle(vehicle)

        let msg = `Succesfully created vehicle`
        console.log(msg)
        return ({ msg, id, code: 200 })
    } catch (error) {
        let msg = `Error while creating vehicle: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const validateModel = (body) => {
    return body;
}

const storeVehicle = async (vehicle) => {
    if (!vehicle.id) {
        console.log(`Creating vehicle...`)
        let id = await admin.firestore().collection('vehicles').add(vehicle)
        return id;
    }
}

const updateVehicle = async (id, body) => {
    try {
        console.log("Updating vehicle with id: " + id)
        let response = await admin.firestore().collection('vehicles').doc(id).update(body);
        return ({ response, code: 200 });

    } catch (error) {
        let msg = `Error while updating vehicle: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const deleteVehicle = async (id) => {
    try {
        //Logical delete
        console.log("Disabling vehicle with id: " + id)
        let response = await admin.firestore().collection('vehicles').doc(id).update({ active: false });
        return ({ response, code: 200 });

        //Physical delete
        /*console.log("Deleting vehicle with id: " + id)
        let deleteDoc = await admin.firestore().collection('vehicles').doc(id).delete();
        let msg = "delete ok"
        return ({ msg, code: 200 });*/

    } catch (error) {
        let msg = `Error while disabling vehicle: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}


const getVehicles = async () => {
    try {
        let vehicles = [];
        vehicles = (await admin.firestore().collection('vehicles').where('active', '==', true).get())._docs().map((doc) => {
            return { ...doc.data(), id: doc.id }
        });

        return ({ vehicles, code: 200 });
    }
    catch (error) {
        let msg = `Error while getting all vehicles` + error.msg;
        console.log(msg);
        return ({ msg, code: 500 });
    }
}

const getVehicle = async (id) => {
    try {
        let vehicle = {};
        vehicle = (await admin.firestore().collection('vehicles').doc(id).get()).data();
        return ({ vehicle, code: 200 });
    }
    catch (error) {
        let msg = `Error while getting vehicle: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const getVehiclesFromAirport = async (id) => {
    try {
        let vehicles = [];
        vehicles = (await admin.firestore().collection('vehicles')
            .where('airport', '==', Number(id))
            .where('active', '==', true)
            .get())._docs().map((doc) => {
                return { ...doc.data(), id: doc.id }
            });

        return ({ vehicles, code: 200 });
    }
    catch (error) {
        let msg = `Error while getting all vehicles` + error.msg;
        console.log(msg);
        return ({ msg, code: 500 });
    }
}

module.exports = { createVehicle, getVehicles, getVehicle, updateVehicle, deleteVehicle, getVehiclesFromAirport }