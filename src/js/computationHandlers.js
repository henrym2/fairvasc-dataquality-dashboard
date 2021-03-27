const computationHandlers = {
    /**
     * @description Convert percentages in an object to whole values based on an input total
     * @param {Object} percentiles 
     * @param {number} total 
     * @returns {Object}
     */
    retrieveQuanta(percentiles, total) {
        return Object.keys(percentiles).reduce((acc, cur) => {
            acc[cur] = Math.floor((percentiles[cur] / 100) * total)
            return acc
        }, {})
    }
}

module.exports = computationHandlers 
