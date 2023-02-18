const WebSocket = require("ws");
const util = require("util");

var ID = 1;

const users = [];

const server = new WebSocket.Server({ port: 80 });

server.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    message = message.toString();
    if (message.startsWith("login:")) {
      user = handleLogin(message);
      // if user is null then the credentials are wrong
      if (!user) {
        ws.send("error:Invalid credentials");
        return;
      }
      registerNewSensor(user, ws);
    } else {
      if (!ws.username) {
        ws.send("error:Not logged in");
      } else {
        const tokens = message.split(":");
        const typeOfMeasurement = tokens[0];
        const value = parseFloat(tokens[1]);
        switch (typeOfMeasurement) {
          case "t":
            addTemperatureMeasurment(ws, value);
            break;
          case "h":
            addHumidityMeasurment(ws, value);
            break;
          case "m":
            addMoistureMeasurment(ws, value);
            break;
          default:
            break;
        }
      }
    }
  });

  // Listen for the close event
  ws.on("close", () => {
    console.log("Client disconnected");
    console.log(
      util.inspect(users[ws.username], {
        showHidden: false,
        depth: null,
        colors: true,
      })
    );
  });
});

// handle Login will return user if there is existing one with these credentials
// or it will create a new one if there is no user with this name
function handleLogin(message) {
  const tokens = message.split(":");
  const username = tokens[1];
  const password = tokens[2];

  let user = users[username];
  if (!user) {
    users[username] = {
      id: ID++,
      username: username,
      password: password,
      sensors: {},
    };
    return users[username];
  }

  if (user.password != password) {
    return null;
  }
  return user;
}

function registerNewSensor(user, ws) {
  const nextSensorId = Object.keys(user.sensors).length + 1;
  ws.username = user.username;
  ws.sensorID = nextSensorId;

  users[user.username].sensors[nextSensorId] = {
    id: nextSensorId,
    moistureMeasurements: [],
    humidityMeasurements: [],
    temperatureMeasurements: [],
  };

  ws.send("success:Sensor registered");
}

function addTemperatureMeasurment(ws, value) {
  let user = users[ws.username];
  // access sensor and add to its measurments
  user.sensors[ws.sensorID].temperatureMeasurements.push({
    time: Date.now(),
    value: value,
  });
}

function addHumidityMeasurment(ws, value) {
  let user = users[ws.username];
  // access sensor and add to its measurments
  user.sensors[ws.sensorID].humidityMeasurements.push({
    time: Date.now(),
    value: value,
  });
}

function addMoistureMeasurment(ws, value) {
  let user = users[ws.username];
  // access sensor and add to its measurments
  user.sensors[ws.sensorID].moistureMeasurements.push({
    time: Date.now(),
    value: value,
  });
}
