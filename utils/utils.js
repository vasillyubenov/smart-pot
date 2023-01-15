module.exports.errorHandler = (err, suc) => {
    if (err) {
        return console.error(err.message);
    }
    suc();
}