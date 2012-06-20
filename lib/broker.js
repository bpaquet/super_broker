var zeromq = require('zmq');

var task_queue = {};
var available_workers = {};

function store_task(task_type, task) {
  if (!task_queue[task_type]) {
    task_queue[task_type] = [];
  }
  task_queue[task_type].push(task);    
}

function create(address, max_worker_delay) {
  var broker = zeromq.socket('router');
  broker.setsockopt('linger', 0);
  broker.on('message', function() {
    var sender_id = arguments[0],
        command = arguments[1];

    if (command == "wait_task") {
      var task_type = arguments[2];
      if (task_queue[task_type] && task_queue[task_type].length > 0) {
        var content = task_queue[task_type].pop();
        broker.send([sender_id, "task", content.publisher, task_type, content.uuid, content.task]);
        // console.log("Task " + task_type + " " + content.uuid + " sent to worker.");
      }
      else {
        if (!available_workers[task_type]) {
          available_workers[task_type] = [];
        }
        available_workers[task_type].push(sender_id);
        setTimeout(function() {
          if (available_workers[task_type].indexOf(sender_id)) {
            available_workers[task_type].splice(available_workers[task_type].indexOf(sender_id), 1);
            broker.send([sender_id, "nothing_to_do"]);
            // console.log("Send nothing to do to a worker");
          }
        }, max_worker_delay || 2000);
        // console.log("Worker waiting for task " + task_type + ".");
      }
    }
    if (command == "publish_task") {
      var task_type = arguments[2],
          task_uuid = arguments[3],
          task = arguments[4];
          full_task = {publisher: sender_id, uuid: task_uuid, task: task};
      if (available_workers[task_type] && available_workers[task_type].length > 0) {
        broker.send([available_workers[task_type].pop(), "task", sender_id, task_type, task_uuid, task]);
        // console.log("Task " + task_type + " " + task_uuid + " sent to worker.");
      }
      else {
        store_task(task_type, full_task);
        // console.log("Task " + task_type + " queued (queue size " + task_queue[task_type].length + ")");
      }
    }
    if (command == "task_result") {
      var task_sender_id = arguments[2],
          task_uuid = arguments[3],
          result = arguments[4];
      broker.send([task_sender_id, task_uuid, result]);
      //console.log("Send task result " + task_uuid + ".");
    }
  });
  broker.on('error', function(err) {
    console.log("Broker error");
    console.log(err);
  })
  broker.bindSync(address);
}

module.exports = {
  create: create
};