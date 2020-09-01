const admin = require('firebase-admin');

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
    return body
}  

const storeVehicle = async (vehicle) => {
    if(!vehicle.id){
        console.log(`Creating vehicle...`)
        let id = await admin.firestore().collection('vehicles').add(vehicle)
        return id;
    }
}


module.exports = { createVehicle }