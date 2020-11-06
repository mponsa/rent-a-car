const admin = require('firebase-admin');
const { googleKey } = require('../config/config')

const initializeApp = () => {
    const credentials = {
        credential: admin.credential.cert(googleKey),
        databaseUrl: "https://rent-a-car-6fd64.firebaseio.com",
        storageBucket: "gs://rent-a-car-6fd64.appspot.com"
    }
    admin.initializeApp(credentials)
}

const initializeDB = () => {
    return admin.firestore()
}

const initializeStorage = () => {
    return admin.storage().bucket()
}

module.exports = { initializeApp, initializeDB, initializeStorage }