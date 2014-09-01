var liveswap = require('liveswap/client')
var async = require('async')

module.exports = function(config) {

  config = config || require('./config')

  var getInstances = require('aws-instances')(config['aws-instances'])

  function getServers(name, cb) {
    getInstances(function(err, instances) {
      cb(err, instances.filter(function(instance) {
        if (!instance.name) return false
        if (instance.name !== name) return false
        if (!instance.online) return false
        return !!instance.privateIpAddress
      }))
    })
  }

  function upgrade(host, cb) {
    var port = config.liveswap.port
    var stream = liveswap.upgrade({
      port: port,
      host: host
    }, function(err, data) {
      stream.end()
      cb(err, data)
    })
  }

  return function(opts, cb) {
    if (typeof opts == 'string') opts = { name: opts }
    getServers(opts.name, function(err, servers) {
      if (err) return cb(err)
      if (!servers.length) return cb(new Error('No servers online'))
      var errors = 0
      async.each(servers, function(server, done) {
        upgrade(server.privateIpAddress, function(err, data) {
          if (err || (!err && data.value !== 'OK')) ++errors
          done()
        })
      }, function() {
        cb && cb(errors > 0 ? new Error('Upgrade failed') : null)
      })
    })
  }

}
