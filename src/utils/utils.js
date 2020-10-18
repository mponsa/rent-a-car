
const parseDate = (date) => {
    /**Receives a string date (yyyy-mm-dd) and returns javascript date object*/
    return new Date(date + 'T00:00:00')
}


module.exports = { parseDate }