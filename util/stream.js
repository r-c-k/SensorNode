//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('../node_modules/iota.lib.js/lib/iota');

//#############################################
//##        SENSORSTREAM CONSTRUCTOR         ##
//#############################################

function STREAM(_stream) {

  this.host = _stream.host || 'localhost';
  this.port = _stream.port || 14265;

  this.id = _stream.id || 'raspNode';
  this.location = _stream.location || '';
  this.sources = [];

  this.seed = _stream.seed || '999999999999999999999999999999999999999999999999999999999999999999999999999999999';
  this.rec_address = _stream.rec || 'GPB9PBNCJTPGFZ9CCAOPCZBFMBSMMFMARZAKBMJFMTSECEBRWMGLPTYZRAFKUFOGJQVWVUPPABLTTLCIA'; /*nowhere*/
  this.tag  = _stream.tag || 'MYSENSORSTREAM';

  this.address = '';
  this.addr_index = 0;

  this.initNode();
}

//#############################################
//##            ADD DATA SOURCE              ##
//#############################################

STREAM.prototype.addSource = function(_f) {
  this.sources.push(_f);
}

//#############################################
//##          HANDLE SENSORSTREAMS           ##
//#############################################

STREAM.prototype.handle = function() {

  let self = this;
  var data = []

  self.sources.forEach(function(s) {
    s().then(result => {
    data.push(result);
       if (data.length == self.sources.length)
       self.attachToTangle(data);
   }).catch(err => { console.error(err); });
  })
}

//#############################################
//##            ATTACH TO TANGLE             ##
//#############################################

STREAM.prototype.attachToTangle = function(_data) {

 let self = this;

 let json = {
    'id':         this.id,
    'location':   this.location,
    'timestamp':  Date.now() / 1000 | 0,
    'data':       _data,
 }

 console.log("\nJSON:");
 console.log(json);

 let trytes = this.iota.utils.toTrytes(JSON.stringify(json));
 //console.log("\nTRYTES:\n" + trytes);

 let options = {'index': this.addr_index, 'total': 1}
 /* GENERATE NEW ADDRESS */
 self.iota.api.getNewAddress(self.seed, options, function(err, newAddress) {
  	if (err) {
      console.error(err);
      return -1;
    } else {

      console.log('\nSENDING...');

       var transfersArray = [{
             'address': self.rec_address,
             'value': 0,
             'message': trytes,
             'tag': self.tag
         }]

       var inputs = [{
             'keyIndex': self.addr_index,
             'address':  self.rec_address,
             'security': 1
         }]

       self.addr_index += 1;

       /* PREPARE TRANSFERS */
       self.iota.api.prepareTransfers(self.seed, transfersArray, inputs, function(err, bundle) {

         if (err) {
           console.error('FAILURE (' + err + ')');
           self.address_index -= 1;
           return -2;

         } else {

           /* PUSH TO TANGLE */
           self.iota.api.sendTrytes(bundle, 3, 14, function(err, result) {

               if (err) {
                 self.address_index -= 1;
                 console.error(err);
                 return -3;
               } else {
                 console.log('SUCCESS (hash: ' + result[0].hash + ')');
               }
           })

         }

       })

    }
 });

}

//#############################################
//##            INITIALISE IOTA              ##
//#############################################

STREAM.prototype.initNode = function() {
  this.iota = new IOTA({
      'host': this.host,
      'port': this.port
  });
}

module.exports = STREAM;
