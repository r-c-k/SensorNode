//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('../node_modules/iota.lib.js/lib/iota');

//#############################################
//##        SENSORSTREAM CONSTRUCTOR         ##
//#############################################

function SENSORSTREAM(_stream) {

  this.host = _stream.host || 'localhost';
  this.port = _stream.port || 14265;

  this.id = _stream.id || 'MySensorNode';
  this.location = _stream.location || '';
  this.stream = [];

  this.seed = _stream.seed || '999999999999999999999999999999999999999999999999999999999999999999999999999999999';
  this.rec_address = _stream.rec || 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  this.tag  = _stream.tag || 'MYSENSORSTREAM';

  this.address = '';
  this.addr_index = 0;

  this.initNode();
}

//#############################################
//##                METHODS                  ##
//#############################################

SENSORSTREAM.prototype.addSource = function(_f) {
  this.stream.push(_f);
}

SENSORSTREAM.prototype.handle = function() {

  let self = this;
  var data = []

  self.stream.forEach(function(s) {
    s().then(result => {
    data.push(result);
       if (data.length == self.stream.length)
       self.attachToTangle(data);
   }).catch(err => { console.error(err); });
  })
}

SENSORSTREAM.prototype.attachToTangle = function(_data) {

 let json = {
    'id':         this.id,
    'location':   this.location,
    'timestamp':  Date.now() / 1000 | 0,
    'data':       _data,
 }

 console.log("\nJSON:");
 console.log(json);

 let trytes = this.iota.utils.toTrytes(JSON.stringify(json));
 console.log("\nTRYTES:\n" + trytes);

 /* EXPERIMENTAL - TO DO*/
 /*
 let options = {'index': this.addr_index++, 'total': 1}
 this.iota.api.getNewAddress(this.seed, options, function(err, newAddress) {
  	if (err) {
      this.addr_index -= 1;
    } else {
      console.log(newAddress);
    }
 });
 */

}

SENSORSTREAM.prototype.initNode = function() {
  this.iota = new IOTA({
      'host': this.host,
      'port': this.port
  });
}

module.exports = SENSORSTREAM;
