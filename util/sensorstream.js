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

  this.id = s.id || 'raspNode';
  this.location = s.location || '';
  this.stream = [];

  this.seed = s.seed || '999999999999999999999999999999999999999999999999999999999999999999999999999999999';
  this.rec_address = s.rec || 'GPB9PBNCJTPGFZ9CCAOPCZBFMBSMMFMARZAKBMJFMTSECEBRWMGLPTYZRAFKUFOGJQVWVUPPABLTTLCIA'; /* nowhere */
  this.tag  = s.tag || 'MYSENSORSTREAM';

  this.address = '';
  this.addr_index = 0;

  this.initNode();
}

//#############################################
//##            ADD DATA SOURCE              ##
//#############################################

SENSORSTREAM.prototype.addSource = function(_f) {
  this.stream.push(_f);
}

//#############################################
//##          HANDLE SENSORSTREAMS           ##
//#############################################

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

//#############################################
//##            ATTACH TO TANGLE             ##
//#############################################

SENSORSTREAM.prototype.attachToTangle = function(_data) {

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

SENSORSTREAM.prototype.initNode = function() {
  this.iota = new IOTA({
      'host': this.host,
      'port': this.port
  });
}

module.exports = SENSORSTREAM;
