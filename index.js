var SENSOR_PING_TIME=5e3,SERVER_PORT=80,HUMIDITY_SENSOR_GPIO=14,SOIL_MOISTURE_SENSOR_GPIO=35,MIN_HUMIDITY_PERCENT=0,MIN_DHT11_TEMP=0,MAX_DHT11_TEMP=50,MIN_SOIL_SENSOR_PERCENT=0,MAX_SOIL_SENSOR_PERCENT=100,WIFI_NAME="QtoKotki",WIFI_OPTIONS={password:"soletisusshokolad69"},AnalogData=function(type,rawData){this.type=type,this.rawData=rawData},DHT11SensorAnalogData=(AnalogData.prototype.setRawData=function(rawData){this.rawData=rawData},function(rawData,temp,rh){AnalogData.call(this,"dht11",rawData),this.temp=temp,this.rh=rh});function startDHT11Sensor(onPing){if(null!=onPing){let sensorData=new DHT11SensorAnalogData(0,0,0);var dht=require("DHT11").connect(HUMIDITY_SENSOR_GPIO);setInterval(function(){dht.read(data=>{sensorData.setHumidityPercent(data.rh),sensorData.setTemperature(data.temp),sensorData.setRawData(data.raw)}),onPing(sensorData)},SENSOR_PING_TIME)}}function startConnection(){const wifi=require("Wifi");let currentClientId=0;var clients=[];function pageHandler(req,res){res.writeHead(200,{"Content-Type":"text/html"}),res.end(`<html>
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
  </html>`)}function wsHandler(ws){currentClientId=clients.length,clients.push(ws),ws.on("message",msg=>{ledState=msg.split("/")[0],pinNumber=Number(msg.split("/")[1]),digitalWrite(pinNumber,"on"==ledState)}),ws.on("close",evt=>{var x=clients.indexOf(ws);-1<x&&clients.splice(x,1)})}function updateReadAnalogData(msg){clients&&clients[currentClientId]&&clients[currentClientId].send(JSON.stringify(msg))}print("connecting..."),wifi.connect(WIFI_NAME,WIFI_OPTIONS,function(err){err&&print(err),wifi.getIP(function(error,inf){error&&print(error),print(inf.ip),(error=require("ws").createServer(pageHandler)).on("websocket",wsHandler),error.listen(SERVER_PORT),startDHT11Sensor(updateReadAnalogData),startSoilMoistureSensor(updateReadAnalogData)})})}function onInit(){console.log("Initializing..."),startConnection()}function startSoilMoistureSensor(onPing){if(null!=onPing){let sensorData=new SoilMoistureSensorAnalogData(0,0),rawData;setInterval(function(){{var moisturePercent;rawData=analogRead(SOIL_MOISTURE_SENSOR_GPIO),isNaN(rawData)||(sensorData.setRawData(rawData),moisturePercent=100-Math.round(100*rawData),sensorData.setMoisturePercent(moisturePercent))}onPing(sensorData)},SENSOR_PING_TIME)}}DHT11SensorAnalogData.prototype=Object.create(AnalogData.prototype),(DHT11SensorAnalogData.prototype.constructor=DHT11SensorAnalogData).prototype.setHumidityPercent=function(rh){rh<MIN_HUMIDITY_PERCENT||(this.rh=rh)},DHT11SensorAnalogData.prototype.setTemperature=function(temp){temp<MIN_DHT11_TEMP||MAX_DHT11_TEMP<temp||(this.temp=temp)},(SoilMoistureSensorAnalogData=function(rawData,moisturePercent){AnalogData.call(this,"moisture",rawData),this.moisturePercent=moisturePercent}).prototype=Object.create(AnalogData.prototype),(SoilMoistureSensorAnalogData.prototype.constructor=SoilMoistureSensorAnalogData).prototype.setMoisturePercent=function(moisturePercent){moisturePercent<MIN_SOIL_SENSOR_PERCENT||MAX_SOIL_SENSOR_PERCENT<moisturePercent||(this.moisturePercent=moisturePercent)},onInit();