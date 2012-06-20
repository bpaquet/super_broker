var worker = require('super_broker').create_worker(["tcp://localhost:5555"]);

worker.loop("toto_message", function(data, callback) {
  console.log(data);
  setTimeout(function() {
    callback("result toto " + data);
  }, 1000);
});