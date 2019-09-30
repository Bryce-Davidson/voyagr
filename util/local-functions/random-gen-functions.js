module.exports = {
    getRandom : async function(arr, n) {
        var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
    return result;
    },
    getRandomInt: async function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },
    randomGeoFromSeed: async function(center, radius) {
        var y0 = center.latitude;
        var x0 = center.longitude;
        var rd = radius / 111300;
    
        var u = Math.random();
        var v = Math.random();
    
        var w = rd * Math.sqrt(u);
        var t = 2 * Math.PI * v;
        var x = w * Math.cos(t);
        var y = w * Math.sin(t);
        
        return [(x + x0), (y + y0)]
    }
}