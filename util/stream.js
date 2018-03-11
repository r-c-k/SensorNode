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

  this.id = _stream.id || 'MyNode';
  this.location = _stream.location || 'Home';
  this.sources = [];

  this.seed = _stream.seed || generateSeed();
  this.rec_address = _stream.rec || 'GPB9PBNCJTPGFZ9CCAOPCZBFMBSMMFMARZAKBMJFMTSECEBRWMGLPTYZRAFKUFOGJQVWVUPPABLTTLCIA'; /*nowhere*/
  this.tag = _stream.tag || 'SENSORNODEROCKS';

  this.depth = _stream.depth || 3;

  this.initNode();
}

//#############################################
//##            ADD DATA SOURCE              ##
//#############################################

STREAM.prototype.addSource = function(_s) {
  this.sources.push(_s);
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

 const scope = this;

 let json = {
    'id':         this.id,
    'location':   this.location,
    'timestamp':  Date.now(),
    'data':       _data,
 }

 console.log("\nJSON:");
 console.log(json);

 let trytes = this.iota.utils.toTrytes(JSON.stringify(json));
 //console.log("\nTRYTES:\n" + trytes);

 console.log('\n\x1b[93m[attaching]\x1b[0m\n');

 var transfersArray = [{
       'address': this.rec_address,
       'value': 0,
       'message': trytes,
       'tag': this.tag
   }]

   /* PREPARE TRANSFERS */
   this.iota.api.prepareTransfers(this.seed, transfersArray, function(err, bundle) {

     if (err) {
       console.log('\x1b[41mERROR\x1b[0m (' + err + ')');
       return -1;
     } else {

       /* PUSH TO TANGLE */
       scope.iota.api.sendTrytes(bundle, scope.depth, 14, function(err, result) {

           if (err) {
             console.log('\x1b[41mERROR\x1b[0m (' + err + ')');
             return -2;
           } else {
             console.log('\x1b[32mSUCCESS (hash: ' + result[0].hash + ')\x1b[0m');
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

//#############################################
//##                   EXPORTS               ##
//#############################################

module.exports = STREAM;
