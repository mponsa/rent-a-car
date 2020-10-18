const admin = require('firebase-admin');
const moment = require('moment');
const { parseDate } = require('../utils/utils')

const createRent = async(body) => {
    try {
        let rent = validateModel(body);
        let document = await storeRent(rent);

        let msg = `Succesfully created rent`        
        return ({msg, id: document.id, code:200})
    } 
    catch(error) {
        let msg = `Error while creating rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const validateModel = (body) => { 
    let rent = {...body}
    rent.timestamp = admin.firestore.FieldValue.serverTimestamp()
    rent.from = parseDate(from)
    rent.to = parseDate(to)
    return rent;
}

const storeRent = async(rent) => {
    if(!rent.id) {
        console.log(`Creating rent...`)
        let id = await admin.firestore().collection('rents').add(rent)
        return id;
    }
}

const getRents = async(from, to) => {
    try {
        const dateFrom = parseDate(from)
        const dateTo = parseDate(to)
        const snapshot = await admin.firestore().collection('rents').where('from', '>=', dateFrom, 'to', '<=', dateTo).get();
        const result = []

        if(snapshot.empty){
            return []
        }
        
        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            //Transform Timestamp
            data.timestamp = moment(data.timestamp.toDate()).format()
            data.from = moment(data.from.toDate()).format().split('T')[0]
            data.to = moment(data.to.toDate()).format().split('T')[0]
            result.push(data)
            data.id = snapshot.id
        })
    
        result.sort((a,b) => {
            return Date.parse(b.timestamp) - Date.parse(a.timestamp)
        })
        
        return ({result, code:200});
    } 
    catch(error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const getRent = async(id) => {
    try {
        let rents = [];
        rent = (await admin.firestore().collection('rents').where('id', '==', id))._docs().map((doc) => doc.data());
        return ({rent, code:200});
    } catch(error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const deleteRent = async(id) => {
    try{
        await admin.firestore().collection('rents').doc(id).delete()
    }catch(error){
        let msg = `Error while deleting rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const modifyRent = async(id, body) => {
    try{   
        validateUpdate(body)
        await admin.firestore().collection('rents').doc(id).update(body)
    }catch(error){
        let msg = `Error while deleting rent: ${error.message}`
        console.log(msg)
        return ({msg, code: 500})
    }
}

const validateUpdate = (body) => {
    const VALID_FIELDS = ['from', 'to']
    const valid = Object.keys(body).every(key => VALID_FIELDS.indexOf(key) >= 0)

    if(valid){
        Object.keys(body).forEach(key => {
            //Transform to javascript DATE
            body[key] = parseDate(body[key])
        })
    }

    throw Error('Invalid update fields!')
}

module.exports = { createRent, getRent, getRents, deleteRent, modifyRent }