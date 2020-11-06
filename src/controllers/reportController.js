const path = require('path');

// Controllers
const vehicleController = require(path.join(__dirname, './vehicleController.js'))
const rentController = require(path.join(__dirname, './rentController.js'))

const createReport = async(airport) => {
    try {
        let vehicles = [];
        let rents = [];

        let report_rents = {
            total: 0,
            average_time: 0,
            average_earned: 0,               
            created: {
                labels: [],
                data: []
            },
            moneyFlow: {
                labels: [],
                data: []
            }
        };
        let report_vehicles = {
            available: 0,
            top_5_rented_models: [],
            created: {
                labels: [],
                data: []
            }
        };

        // se haran los reportes con el dia actual a 30 dias para atras
        let date = new Date();
        let to = date.toISOString().split('T')[0];
        date.setDate(date.getDate() - 30);
        let from = date.toISOString().split('T')[0];
        
        // obtencion de vehiculos y alquileres
        await vehicleController.getVehicles().then((response) => { vehicles = response.vehicles});
        await rentController.getRents(from, to).then((response) => { rents = response.result});

        // filtrado de vehiculos por aeropuerto
        let vehicles_temp = vehicles.filter(item => { return item.airport.toString().includes(airport)});
        report_vehicles.available = vehicles_temp.filter(item => { return item.active}).length;

        // obtencion de los alquileres de vehiculos filtrados
        let rents_temp = [];
        for(var i = 0; i < vehicles_temp.length; i++) {
            for(var j = 0; j < rents.length; j++) {
                if(rents[j].car_id === vehicles_temp[i].id) {
                    rents_temp.push(rents[j]);
                }
            }
        }

        report_rents.total = rents_temp.length;

        // tiempo promedio de alquileres
        report_rents.average_time = getAverageTime(rents_temp, report_rents.total);
        // dinero ganado de alquieleres
        report_rents.average_earned = getAverageEarned(vehicles_temp, rents_temp, report_rents.total);
        
        // los 5 modelos mas pedidos
        report_vehicles.top_5_rented_models = getMostRentedModel(vehicles_temp, rents_temp);

        return ({report_rents, report_vehicles, code: 200});
    }
    catch (error) {
        let msg = `Error while creating the report` + error.msg;
        console.log(msg);
        return ({ msg, code: 500 });
    }
}

const getAverageTime = (rents, total) => {
    let aux = 0;
    rents.forEach(item => {
        let from = new Date(item.from);
        let to = new Date(item.to);
        aux +=  (to.getTime() - from.getTime()) / (1000 * 3600 * 24);
    });

    return aux / total;
}

const getAverageEarned = (vehicles, rents, total) => {
    let aux = 0;
    for(var i = 0; i < vehicles.length; i++) {
        for(var j = 0; j < rents.length; j++) {
            if(rents[j].car_id === vehicles[i].id) {
                aux += vehicles[i].price * rentedDays(rents[j].from, rents[j].to);
            }
        }
    }

    return aux / total;
}

const rentedDays = (from, to) => {   
    from = new Date(from); 
    to = new Date(to);    
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));     
    return diffDays;
}

const getMostRentedModel = (vehicles, rents) => {
    let rented_vehicles = {};
    for(var i = 0; i < vehicles.length; i++) {
        for(var j = 0; j < rents.length; j++) {
            if(rents[j].car_id === vehicles[i].id) {
                if(rented_vehicles[vehicles[i].brand + ',' + vehicles[i].model]) {
                    rented_vehicles[vehicles[i].brand + ',' + vehicles[i].model]++;
                }
                else {
                    rented_vehicles[vehicles[i].brand + ',' + vehicles[i].model] = 1;
                }                
            }
        }
    }

    var rented_vehicles_array = Object.keys(rented_vehicles).map(function(key) {
        return [key, rented_vehicles[key]];
    });

    rented_vehicles_array.sort(function(first, second) {
        return second[1] - first[1];
    });    

    return rented_vehicles_array.slice(0, 5);
}

module.exports = { createReport }