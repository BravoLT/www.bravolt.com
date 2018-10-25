const sendEmail = require('./send_email')

exports.handle = function(event, ctx, callback) {
  console.log('processing event: %j', event)

  if (event.subject && event.body) {

    sendEmail(event.subject, event.body, event.resumeName, event.resume).then((result) => {
      callback(null, result)
    }, callback)

  } else {
    callback(new Error('Invalid payload: ' + JSON.stringify(event)))
  }
}
