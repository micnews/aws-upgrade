module.exports = require('rc')('aws-upgrade', {
  'aws-instances': {
    accessKeyId: '<access key id goes here>',
    secretAccessKey: '<secret access key goes here>'
  },
  liveswap: {
    port: 3000
  }
})
