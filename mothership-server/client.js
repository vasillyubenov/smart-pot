const WebSocket = require("ws");
const prompt = require("prompt-sync")({ sigint: true });

const SENSOR_PING_TIME = 5000;
const SOIL_MOISTURE_SENSOR_GPIO = 35;
const HUMIDITY_SENSOR_GPIO = 14;//prev 22



async function main() {
  const ws = new WebSocket("ws://192.168.1.2:80");

  ws.onmessage = (event) => {
    const message = event.data;

    if (message.startsWith("success:")) {
      console.log(message);
    } else if (message.startsWith("error:")) {
      console.error(message);
    } else {
      console.log(message);
    }
  };

  ws.onopen = () => {
    // const username = prompt("Enter your username:");
    // const password = prompt("Enter your password:");
    // ws.send(`login:${username}:${password}`);
    ws.send(`login:alex:123`);
  };

  await new Promise((resolve) => setTimeout(resolve, 2000));

  startSoilMoistureSensor((mois) => {
    ws.send(`m:${mois}`);
  });

  startDHT11Sensor(
    (temp) => {
      ws.send(`t:${temp}`);
    },
    (hum) => {
      ws.send(`h:${hum}`);
    }
  );
}

main();

function startSoilMoistureSensor(sendMoisture) {
  setInterval(doReading, SENSOR_PING_TIME);

  function doReading() {
    var rawData = analogRead(SOIL_MOISTURE_SENSOR_GPIO); //spits back 0.0(LOW) - 1.0(HIGH)
    let moisturePercent;
    if (!isNaN(rawData)) {
      sensorData.setRawData(rawData);
      /*
       * This gives us a number between 0 - 100 where 100 is bone dry
       * I want it be the reverse so 100 is essentially a glass of water
       */
      moisturePercent = 100 - Math.round(rawData * 100);
      sensorData.setMoisturePercent(moisturePercent);
    }

    sendMoisture(moisturePercent);
  }
}

function startDHT11Sensor(sendTemperature, sendHumidity) {
  var dht = require("DHT11").connect(HUMIDITY_SENSOR_GPIO);
  setInterval(doReading, SENSOR_PING_TIME);

  function doReading() {
    /*
     * This passes dht11 sensor data to onPing method which is supposed
     * to update current plant state and display data in human readable format
     */
    let temp;
    let rh;
    dht.read((data) => {
      temp = data.temp;
      rh = data.rh;
    });

    sendTemperature(temp);
    sendHumidity(rh);
  }
}
