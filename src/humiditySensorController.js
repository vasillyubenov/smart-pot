function startDHT11Sensor(onPing) {
    if (onPing == null) {
        return;
    }

    let sensorData = new DHT11SensorAnalogData(0, 0, 0);

    var dht = require("DHT11").connect(HUMIDITY_SENSOR_GPIO);
    setInterval(doReading, SENSOR_PING_TIME);

    function doReading() {
        /*
        * This passes dht11 sensor data to onPing method which is supposed 
        * to update current plant state and display data in human readable format
        */
        dht.read(data => {
            sensorData.setHumidityPercent(data.rh);
            sensorData.setTemperature(data.temp);
            sensorData.setRawData(data.raw);
        });

        onPing(sensorData);
    }
}