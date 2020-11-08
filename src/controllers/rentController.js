const admin = require('firebase-admin');
const moment = require('moment');
const { parseDate, diffDatesInDays } = require('../utils/utils')

const createRent = async (body) => {
    try {
        let rent = await validateModel(body);
        let document = await storeRent(rent);

        let msg = `Succesfully created rent`
        return ({ msg, id: document.id, code: 200 })
    }
    catch (error) {
        let msg = `Error while creating rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const validateModel = async (body) => {
    let rent = { ...body }
    rent.timestamp = admin.firestore.FieldValue.serverTimestamp()

    const rents = (await getRentsForVehicle(rent.from, rent.to, rent.car_id)).result

    if (rents.length > 0) {
        throw Error('Ya existe un alquiler para el vehículo en ese período. Intente nuevamente.')
    }

    rent.from = parseDate(rent.from)
    rent.to = parseDate(rent.to)

    if (rent.from < new Date()) {
        throw Error('No se puede crear un alquiler en el pasado.')
    }

    if (rent.to < rent.from) {
        throw Error('Rango inválido de fechas para el alquiler.')
    }

    if (diffDatesInDays(rent.from, rent.to) < 1) {
        throw Error('El alquiler debe ser por lo menos de un día.')
    }

    return rent;
}

const storeRent = async (rent) => {
    if (!rent.id) {
        console.log(`Creating rent...`)
        let id = await admin.firestore().collection('rents').add(rent)
        return id;
    }
}

//Returns active rents in a time-frame
const getRents = async (from, to) => {
    try {
        const dateFrom = parseDate(from)
        const dateTo = parseDate(to)
        const snapshot = await admin.firestore().collection('rents').where('from', '>=', dateFrom,'to').get();
        const result = []

        if (snapshot.empty) {
            return []
        }

        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            //Transform Timestamp
            if (moment(data.to.toDate()).isBefore(moment(to))) {
                data.timestamp = moment(data.timestamp.toDate()).format()
                data.from = moment(data.from.toDate()).format().split('T')[0]
                data.to = moment(data.to.toDate()).format().split('T')[0]
                result.push(data)
                data.id = snapshot.id
            }
        })
        result.sort((a, b) => {
            return Date.parse(b.from) - Date.parse(a.from)
        })

        return ({ result, code: 200 });
    }
    catch (error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}
//Returns created rents in a time-frame
const getCreatedRents = async(from,to) => {
    try {
        const dateFrom = parseDate(from)
        const dateTo = parseDate(to)
        const snapshot = await admin.firestore().collection('rents').where('timestamp', '>=', dateFrom,'timestamp','<=',dateTo).get();
        const result = []

        if (snapshot.empty) {
            return []
        }

        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            //Transform Timestamp
            if (moment(data.to.toDate().setHours(0)).isSameOrBefore(moment(to))) {
                data.timestamp = moment(data.timestamp.toDate()).format()
                data.from = moment(data.from.toDate()).format().split('T')[0]
                data.to = moment(data.to.toDate()).format().split('T')[0]
                result.push(data)
                data.id = snapshot.id
            }
        })
        result.sort((a, b) => {
            return Date.parse(b.from) - Date.parse(a.from)
        })

        return ({ result, code: 200 });
    }
    catch (error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const getRentsForVehicle = async (from, to, vehicleId) => {
    try {
        const dateFrom = parseDate(from)
        const dateTo = parseDate(to)
        const snapshot = await admin.firestore().collection('rents').where('car_id', '==', vehicleId).where('from', '>=', dateFrom).get();
        const result = []

        if (snapshot.empty) {
            return { result: [], code: 200 }
        }

        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            //Transform Timestamp
            if (moment(data.to.toDate().setHours(0)).isSameOrBefore(moment(dateTo))) {
                data.timestamp = moment(data.timestamp.toDate()).format()
                data.from = moment(data.from.toDate()).format().split('T')[0]
                data.to = moment(data.to.toDate()).format().split('T')[0]
                data.id = snapshot.id
                result.push(data)
            }
        })

        result.sort((a, b) => {
            return Date.parse(b.from) - Date.parse(a.from)
        })

        return ({ result, code: 200 });
    } catch (error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const getRent = async (id) => {
    try {
        const rent = (await admin.firestore().collection('rents').doc(id).get()).data()
        return ({ rent, code: 200 });
    } catch (error) {
        let msg = `Error while getting rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const deleteRent = async (id) => {
    try {
        const rent = (await admin.firestore().collection('rents').doc(id).get()).data()
        if (rent) {
            await admin.firestore().collection('rents').doc(id).delete()
            const msg = 'Succesfully deleted rent'
            return ({ msg, code: 200 });
        }
        const msg = `Rent with id ${id} doesn't exist`
        return ({ msg, code: 400 });

    } catch (error) {
        let msg = `Error while deleting rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const modifyRent = async (id, body) => {
    try {
        validateUpdate(body)
        const rent = (await admin.firestore().collection('rents').doc(id).get()).data()
        if (rent) {
            await admin.firestore().collection('rents').doc(id).update(body)
            const msg = 'Succesfully modified rent'
            return ({ msg, code: 200 });
        }
        const msg = `Rent with id ${id} doesn't exist`
        return ({ msg, code: 400 });
    } catch (error) {
        let msg = `Error while updating rent: ${error.message}`
        console.log(msg)
        return ({ msg, code: 500 })
    }
}

const validateUpdate = (body) => {
    const VALID_FIELDS = ['from', 'to']
    const valid = Object.keys(body).every(key => VALID_FIELDS.indexOf(key) >= 0)

    if (valid) {
        Object.keys(body).forEach(key => {
            //Transform to javascript DATE
            body[key] = parseDate(body[key])
        })
    }
    else throw Error('Invalid update fields!')
}

module.exports = { createRent, getRent, getRents,getCreatedRents, getRentsForVehicle, deleteRent, modifyRent }