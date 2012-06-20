var worker = require('./messaging/worker.js').create(["tcp://localhost:5555"]);

worker.loop("toto_message", function(data, callback) {
  console.log(data);
  setTimeout(function() {
    callback("result toto " + data);
  }, 250);
});