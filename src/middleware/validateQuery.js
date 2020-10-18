const MANDATORY_PARAMS = {
    'GET_/RENTS': ['from', 'to'],
    'GET_/VEHICLES/AIRPORT/:ID': ['from', 'to']
}

const getKey = (req) => {
    return [req.method.toUpperCase(), req.route.path.toUpperCase()].join('_')
}

module.exports = (req, res, next) => {
    const params = MANDATORY_PARAMS[getKey(req)]
    const valid = params.every(key => Object.keys(req.query).indexOf(key) >= 0 && req.query[key] != '')

    if(valid){
        next()
        return
    }
    
    const msg = `${params} are mandatory query params`
    res.status(400).send({msg, code:400})
};


