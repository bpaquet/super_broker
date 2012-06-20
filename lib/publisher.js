var zeromq = require('zmq'),
    uuid = require('node-uuid');

var task_callback = {};

function create(addresses) {
  var publisher = zeromq.socket('dealer');
  
  addresses.forEach(function(address) {
    publisher.connect(address);
  });

  publisher.on('message', function() {
    var task_uuid = arguments[0],
        callback = task_callback[task_uuid];
    if (callback) {
      callback(arguments[1].toString());
      task_callback[task_uuid] = undefined;
    }
  });

  return {
    publish_task: function(task_type, data, callback) {
      var task_uuid = uuid.v1();
      task_callback[task_uuid] = callback;
      publisher.send(["publish_task", task_type, task_uuid, data]);
    },

  };
}

module.exports = {
  create: create
};