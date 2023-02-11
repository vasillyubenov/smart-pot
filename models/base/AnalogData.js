// class AnalogData {
//     constructor(type, rawData) {
//         this.type = type;
//         this.rawData = rawData;
//     }

//     setRawData(rawData) {
//         this.rawData = rawData;
//     }
// }

var AnalogData = function(type, rawData) {
    this.type = type;
    this.rawData = rawData;
}

AnalogData.prototype.setRawData = function(rawData) {
    this.rawData = rawData;
}