const computationHandlers = {
    retrieveQuanta(percentiles, total) {
        return Object.keys(percentiles).reduce((acc, cur) => {
            acc[cur] = Math.floor((percentiles[cur] / 100) * total)
            return acc
        }, {})
    }
}

module.exports = computationHandlers 
