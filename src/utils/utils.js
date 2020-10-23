
const parseDate = (date) => {
    /**Receives a string date (yyyy-mm-dd) and returns javascript date object*/
    return new Date(date + 'T00:00:00')
}

const diffDatesInDays = (a, b) =>{
    const diffTime = Math.abs(b - a);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}


module.exports = { parseDate, diffDatesInDays }