const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const utils = require('../utils/utils.js');
const errorHandler = utils.errorHandler;

const db = new sqlite3.Database(path.resolve(__dirname, "./plant.db"), sqlite3.OPEN_READWRITE, (err) => {
    errorHandler(err, () => console.log("Connected to DB succesfully!"));
});

db.all("SELECT * from plants", [], (err, rows) => {
    errorHandler(err, () => {
        rows.forEach(row => {
            console.log(row);
        });
    })
});