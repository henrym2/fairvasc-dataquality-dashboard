export default {
    normalize(min, max) {
        var delta = max - min;
        return function (val) {
            return (val - min) / delta;
        };
    },
    filterObjectKeys(obj, filter) {
        return Object.keys(obj)
        .filter(key => filter.includes(key))
        .reduce((acc, key) => {
          acc[key] = obj[key];
          return acc
        }, {})
    },
    filterReg (arr, registries) {
        let reg = registries.filter(r => r.selected).map(r => r.Registry);
        return arr.filter(d => reg.includes(d.name))
    },
    averageAll(arr) {
      return arr.map(e => {
        const vals = Object.values(e.data)
        const avg = vals.reduce((acc, v) => acc + parseInt(v), 0)/vals.length
        return [e.name, avg]
      })
    },
    filterVals(arr, filter) {
        return arr.map(e => ({
          name: e.name, 
          data: this.filterObjectKeys(e.data, filter)
        }))
    }
}