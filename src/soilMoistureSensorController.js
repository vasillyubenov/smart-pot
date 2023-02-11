function startSoilMoistureSensor(onPing) {
    if (onPing == null) {
        return;
    }

    let sensorData = new SoilMoistureSensorAnalogData(0, 0);

    setInterval(doReading, SENSOR_PING_TIME);

    function doReading() {
        var rawData = analogRead(SOIL_MOISTURE_SENSOR_GPIO); //spits back 0.0(LOW) - 1.0(HIGH)

        if (!isNaN(rawData)){
            sensorData.setRawData(rawData);
            /*
            * This gives us a number between 0 - 100 where 100 is bone dry
            * I want it be the reverse so 100 is essentially a glass of water
            */
            let moisturePercent = 100 - Math.round(rawData * 100);
            sensorData.setMoisturePercent(moisturePercent);
        }

        onPing(sensorData);
    };
}