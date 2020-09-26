const admin = require('firebase-admin');

const rent = {
    from: '',
    to: '',
    car_id: 0
}

const createRent = async(body) => {
    try {
        let rent = validateModel(body);
        let id = await storeRent(rent);

        let msg = `Succesfully created rent`        
        return ({msg, id, code:200})
    } 
    catch(error) {
        let msg = `Error while creating rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const validateModel = (body) => { 
    return body;
}

const storeRent = async(rent) => {
    if(!rent.id) {
        console.log(`Creating rent...`)
        let id = await admin.firestore().collection('rent').add(rent)
        return id;
    }
}

const getRents = async(from, to) => {
    try {
        let rent = {};
        rent = await admin.firestore().collection('rent').where('from', '==', from, 'to', '==', to).get();
        return ({rent, code:200});
    } 
    catch(error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const getRent = async(from, to, id) => {
    try {
        let rents = [];
        rents = (await admin.firestore().collection('rent').where('id', '==', id, 'from', '==', from, 'to', '==', to))._docs().map((doc) => doc.data());
        return ({rents, code:200});
    } catch(error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

module.exports = { createRent, getRent, getRents }