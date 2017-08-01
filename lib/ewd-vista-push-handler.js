module.exports = {};

/* Sets up Symbol Table management
 * Called when module is loaded by QEWD */
module.exports.init = function() {
  //vista.init.call(this);
};

module.exports.restModule = true;

module.exports.handlers = {};

module.exports.handlers.taskman = function(msgObj, finished) {
  var activeSessions = this.sessions.active();
  // Need to use fat arrow to prevent rebinding of this
  activeSessions.forEach(ewdSession => {
    var id = ewdSession.socketId;
    if (id && ewdSession.data.$('currentApplication').value === 'taskman-monitor' && msgObj.query.task && !msgObj.query.action !== 'delete') {
      let taskNode = new this.documentStore.DocumentNode('%ZTSK',[msgObj.query.task]);
      let task = {};
      task.number = msgObj.query.task;
      task.fields = taskNode.getDocument();
      // We may get a race condition here (did task delete before we manage to get the data?).
      // Check that we have data.
      if (Object.keys(task.fields).length !== 0) {
        process.send({
          socketId: ewdSession.socketId,
          type: 'taskmanPush',
          message: task
        });
      }
    }
    if (id &&ewdSession.data.$('currentApplication').value === 'taskman-monitor' && msgObj.query.task && msgObj.query.action === 'delete')
    {
      process.send({
        socketId: ewdSession.socketId,
        type: 'taskmanDelete',
        message: msgObj.query.task
      });
    }
  });



  finished({status: 'ok'});
};
