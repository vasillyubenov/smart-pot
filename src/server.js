// digitalWrite(2, false);
function startConnection() {
  var clients = [];

  print("connecting...");

  // Connect to WiFi
  wifi.connect(WIFI_NAME, WIFI_OPTIONS, err => {
    if (err !== null) {
      throw err;
    }
    // Print IP address
    wifi.getIP((err, info) => {
      if (err !== null) {
        throw err;
      }
      print(info.ip);
      startServer();
    });
  });

  // Create and start server
  function startServer() {
    const s = require('ws').createServer(pageHandler);
    s.on('websocket', wsHandler);
    s.listen(80);
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

  led.onchange = evt => {
    ws.send(led.value + "/" + pinNumberInput.value);
  };
};
</script>
</head>
<body>
  <p>Pin number: </p>
  <input id="pin-number" type="number" value="2"/>

  <p>
    LED on:
    <select id="led">
      <option>off</option>
      <option>on</option>
    </select>
  </p>
</body>
</html>`);
  }

  // WebSocket request handler
  function wsHandler(ws) {
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

  // Send msg to all current websocket connections
  function broadcast(msg) {
    clients.forEach(cl => cl.send(msg));
  }
}