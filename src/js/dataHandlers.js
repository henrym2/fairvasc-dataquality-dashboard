/**
 * @typedef {{
 *  name: string,
 *  data: {
 *    field: number
 *  }[]
 * }} dataArray
 */
export default {
    /**
     * @description Normalization closure function for reducing oversized values to a delta standard between min and max
     * @param {number} min
     * @param {number} max
     * @returns {(val: number) => number} Function to use as normalization
     * @namespace
     */
    normalize(min, max) {
        var delta = max - min;
        return function (val) {
            return (val - min) / delta;
        };
    },
    /**
     * @description Function for filtering an objects keys. Takes an object and list of keys to filter, removes all keys not in the filter and then returns a new object containing key value pairs.
     * @param {object} obj Object to filter
     * @param {string[]} filter Filter list
     * @returns {object} Returns a new object containing only the expected keys
     */
    filterObjectKeys(obj, filter) {
        return Object.keys(obj)
        .filter(key => filter.includes(key))
        .reduce((acc, key) => {
          acc[key] = obj[key];
          return acc
        }, {})
    },
    /**

     * @description Takes in a data object, an array of objects containing the name and data for each registry and returns only the registries specified in the registries parameter
     * @param {dataArray} arr data array
     * @param {object[]} registries Array of registry objects
     * @returns {dataArray} filtered version of input array
     */
    filterReg (arr, registries) {
        let reg = registries.filter(r => r.selected).map(r => r.Registry);
        return arr.filter(d => reg.includes(d.name))
    },
    /**
     * @description Function that takes in a data array and returns the average data/metric value for each object in the array
     * @param {dataArray} arr 
     * @returns {[name: string, average: number][]} An array of 2 element arrays which contain a registry name and an associated "average" value
     */
    averageAll(arr) {
      return arr.map(e => {
        const vals = Object.values(e.data)
        const avg = vals.reduce((acc, v) => acc + parseInt(v), 0)/vals.length
        return [e.name, avg]
      })
    },
    /**
     * Supporting interface for filtering each data object in the input data array using the filterObjectKeys function
     * @param {dataArray} arr Data array to be filtered
     * @param {string[]} filter Key names to filter
     * @returns {dataArray}
     */
    filterVals(arr, filter) {
        return arr.map(e => ({
          name: e.name, 
          data: this.filterObjectKeys(e.data, filter)
        }))
    }
}