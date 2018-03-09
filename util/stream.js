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

  this.seed = _stream.seed || generateSeed();
  this.rec_address = _stream.rec || 'GPB9PBNCJTPGFZ9CCAOPCZBFMBSMMFMARZAKBMJFMTSECEBRWMGLPTYZRAFKUFOGJQVWVUPPABLTTLCIA'; /*nowhere*/
  this.tag  = _stream.tag || 'MYSENSORSTREAM';

  this.initNode();
}

//#############################################
//##            ADD DATA SOURCE              ##
//#############################################

STREAM.prototype.addSource = function(_f) {
  this.sources.push(_f);
}

//#############################################
//##             HANDLE SOURCES              ##
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

 console.log('\n[attaching]\n');

 var transfersArray = [{
       'address': this.rec_address,
       'value': 0,
       'message': trytes,
       'tag': this.tag
   }]

   /* PREPARE TRANSFERS */
   this.iota.api.prepareTransfers(this.seed, transfersArray, function(err, bundle) {

     if (err) {
       console.error('FAILURE (' + err + ')');
       return -1;
     } else {

       /* PUSH TO TANGLE */
       self.iota.api.sendTrytes(bundle, 3, 14, function(err, result) {

           if (err) {
             console.error(err);
             return -2;
           } else {
             console.log('SUCCESS (hash: ' + result[0].hash + ')');
           }
       })

     }

   })

}

//#############################################
//##            INITIALIZE IOTA              ##
//#############################################

STREAM.prototype.initNode = function() {
  this.iota = new IOTA({
      'host': this.host,
      'port': this.port
  });
}

module.exports = STREAM;

//#############################################
//##                 HELPER                  ##
//#############################################

function generateSeed () {
 var seed = "";
 var trytes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

 for (var i = 0; i < 81; i++)
   seed += trytes.charAt(Math.floor(Math.random() * trytes.length));

 return seed;
}
