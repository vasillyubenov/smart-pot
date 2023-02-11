function startConnection() {
  const wifi = require("Wifi");
  let currentClientId = 0;

  var clients = [];
  print("connecting...");

  // Connect to WiFi
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, function(err){
      if(err) {
        print(err); 
      }
      wifi.getIP(function (error, inf) {
        if(error) {
          print(error);
        } 
        print(inf.ip);
        startServer();
      });
    }
  )

  // Create and start server
  function startServer() {
    const s = require("ws").createServer(pageHandler);
    s.on('websocket', wsHandler);
    s.listen(SERVER_PORT);

    //Start pinging temperature and humidity sensor (DHT11)
    startDHT11Sensor(updateReadAnalogData);
    //Start pinging soil moisture sensor
    startSoilMoistureSensor(updateReadAnalogData);
  }

  // Page request handler
  function pageHandler(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end(`<html>
  <head>
  <script>
  window.onload = () => {
    var ws = new WebSocket('ws://' + location.host, 'protocolOne');
    var led = document.getElementById('led');
    var pinNumberInput = document.getElementById('pin-number');
    var temperature = document.getElementById('temp-value');
    var humidity = document.getElementById('hum-value');
    var soilMoisture = document.getElementById('soil-moisture');

    led.onchange = evt => {
      ws.send(led.value + "/" + pinNumberInput.value);
    };

    ws.onmessage = message => {
      var data = JSON.parse(message.data);
      switch(data.type) {
        case "dht11": 
          temperature.innerHTML = data.temp + "°C";
          humidity.innerHTML = data.rh + "%";
          break;
        case "moisture": 
          soilMoisture.innerHTML = data.moisturePercent + "%";
          break;
      }
      
      console.log(JSON.parse(message.data));
    };
  };
  </script>
  </head>
  <body>
    <p>Pin number: </p>
    <input id="pin-number" type="text" value="2"/>

    <p>
      LED on:
      <select id="led">
        <option>off</option>
        <option>on</option>
      </select>
    </p>
    <span>Temperature (in degrees Celsius): </span>
    <p id="temp-value">0</p>
    <span>Humidity percent: </span>
    <p id="hum-value">0%</p>
    <span>Soil moisture percent: </span>
    <p id="soil-moisture">0%</p>
  </body>
  </html>`);
    }

    // WebSocket request handler
    function wsHandler(ws) {
      currentClientId = clients.length;
      clients.push(ws);
      ws.on('message', msg => {
        ledState = msg.split("/")[0];
        pinNumber = Number(msg.split("/")[1]);
        digitalWrite(pinNumber, ledState == 'on');
      });
      ws.on('close', evt => {
        var x = clients.indexOf(ws);
        if (x > -1) {
          clients.splice(x, 1);
        }
      });
    }

    // Used for:
    // Sending messages to current user websocket about his updated soil moisture reading
    // Sending messages to current user websocket about his updated humidity and temperature readings
    function updateReadAnalogData(msg) {
      if (clients && clients[currentClientId]) {
        clients[currentClientId].send(JSON.stringify(msg));
      }
    }
}