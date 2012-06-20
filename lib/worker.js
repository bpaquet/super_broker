var zeromq = require('zmq');

function create(addresses) {
  var worker = zeromq.socket('dealer');

  addresses.forEach(function(address) {
    worker.connect(address);
  });

  return {
    loop: function(task_type, callback) {
      worker.on('message', function() {
        var command = arguments[0];

        if (command == "task") {
          var sender_id = arguments[1],
              task_uuid = arguments[3],
              data = arguments[4];

          callback(data.toString(), function(result) {
            worker.send(["task_result", sender_id, task_uuid, result]);
            worker.send(["wait_task", task_type]);
          });
        }
        else {
          worker.send(["wait_task", task_type]);
        }
      });
      worker.send(["wait_task", task_type]);
    }
  }

}

module.exports = {
  create: create
};