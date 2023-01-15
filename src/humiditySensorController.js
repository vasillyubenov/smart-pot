function startDHT11Sensor() {
    digitalWrite(23, true);
    pinMode(22,'output');
    digitalWrite(22, true);
    var i = 0;
    
    var dht = require("DHT11").connect(22);
    var updateSensor = setInterval(doReading, 1000);
    
    function doReading() {
      if (i >= 100) {
        clearInterval(updateSensor);
        return;
      }
      
      dht.read((a) => {
        console.log("Temp is " + a.temp.toString() + " and RH is " + a.rh.toString());
      });
      i++;
    }
    
}