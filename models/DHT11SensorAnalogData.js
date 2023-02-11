// class DHT11SensorAnalogData extends AnalogData {
//     constructor(rawData, temp, rh) {
//         super("dht11", rawData);
//         this.temp = temp;
//         this.rh = rh;
//     }

//     setTemperature(temp) {
//         if (temp < MIN_DHT11_TEMP || temp > MAX_DHT11_TEMP) {
//             return;
//         }

//         this.temp = temp;
//     }

//     setHumidityPercent(rh) {
//         if (rh < MIN_HUMIDITY_PERCENT) {
//             return;
//         }

//         this.rh = rh;
//     }
// }

var DHT11SensorAnalogData = function (rawData, temp, rh) {
    AnalogData.call(this, "dht11", rawData);
    this.temp  = temp;
    this.rh = rh;
};

DHT11SensorAnalogData.prototype = Object.create(AnalogData.prototype);
DHT11SensorAnalogData.prototype.constructor = DHT11SensorAnalogData;

DHT11SensorAnalogData.prototype.setHumidityPercent = function(rh) {
    if (rh < MIN_HUMIDITY_PERCENT) {
        return;
    }

    this.rh = rh;
}

DHT11SensorAnalogData.prototype.setTemperature = function(temp) {
    if (temp < MIN_DHT11_TEMP || temp > MAX_DHT11_TEMP) {
        return;
    }

    this.temp = temp;
}