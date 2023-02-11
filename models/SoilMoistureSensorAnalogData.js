// class SoilMoistureSensorAnalogData extends AnalogData {
//     constructor(rawData, moisturePercent) {
//         super("moisture", rawData);
//         this.moisturePercent = moisturePercent;
//     }

//     setMoisturePercent(moisturePercent) {
//         if (moisturePercent < MIN_SOIL_SENSOR_PERCENT || moisturePercent > MAX_SOIL_SENSOR_PERCENT) {
//             return;
//         }

//         this.moisturePercent = moisturePercent;
//     }
// }

SoilMoistureSensorAnalogData = function (rawData, moisturePercent) {
    AnalogData.call(this, "moisture", rawData);
    this.moisturePercent = moisturePercent;
};

SoilMoistureSensorAnalogData.prototype = Object.create(AnalogData.prototype);
SoilMoistureSensorAnalogData.prototype.constructor = SoilMoistureSensorAnalogData;

SoilMoistureSensorAnalogData.prototype.setMoisturePercent = function(moisturePercent) {
    if (moisturePercent < MIN_SOIL_SENSOR_PERCENT || moisturePercent > MAX_SOIL_SENSOR_PERCENT) {
        return;
    }

    this.moisturePercent = moisturePercent;
}