//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('../node_modules/iota.lib.js/lib/iota');

//#############################################
//##        SENSORSTREAM CONSTRUCTOR         ##
//#############################################

function SENSORSTREAM(s) {

  this.host = s.host || 'localhost';
  this.port = s.port || 14265;

  this.id = s.id || 'MySensorNode';
  this.location = s.location || '';
  this.stream = [];

  this.seed = s.seed || '999999999999999999999999999999999999999999999999999999999999999999999999999999999';
  this.rec_address = s.rec || 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  this.tag  = s.tag || 'MYSENSORSTREAM';

  this.address = '';
  this.addr_index = 0;

  this.initNode();
}

//#############################################
//##                METHODS                  ##
//#############################################

SENSORSTREAM.prototype.addSource = function(f) {
  this.stream.push(f);
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

SENSORSTREAM.prototype.attachToTangle = function(data) {

 let json = {
    'id':         this.id,
    'location':   this.location,
    'timestamp':  Date.now() / 1000 | 0,
    'data':       data,
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
