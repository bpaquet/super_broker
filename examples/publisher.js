var publisher = require('super_broker').create_publisher(["tcp://localhost:5555"]);

publisher.publish_task("toto_message", process.argv[2], function(result) {
  console.log(result);
});


publisher.publish_task("toto_message", process.argv[3], function(result) {
  console.log(result);
});
