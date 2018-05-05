//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('iota.lib.js');

//#############################################
//##        TANGLESTREAM CONSTRUCTOR         ##
//#############################################

class STREAM {

  constructor (_stream) {

    this.iota = new IOTA({
        'host': _stream.host || '0.0.0.0',
        'port': _stream.port || 14265
    });

    this.id = _stream.id || 'SensorNode';
    this.location = _stream.location || 'Home';
    this.sources = [];

    this.seed = _stream.seed || this.generateSeed();
    this.rec_address = _stream.rec || 'GPB9PBNCJTPGFZ9CCAOPCZBFMBSMMFMARZAKBMJFMTSECEBRWMGLPTYZRAFKUFOGJQVWVUPPABLTTLCIA'; /*nowhere*/
    this.tag = _stream.tag || 'SENSORNODEROCKS';

    this.wait = (_stream.wait == false ? false : true);	/* discards packets till the current packet has been send */
    this.busy = false;

    this.depth = _stream.depth || 3;

    this.initNode();
  }

  //#############################################
  //##            ADD DATA SOURCE              ##
  //#############################################

  addSource (_s) {
    this.sources.push(_s);
  }

  //#############################################
  //##             HANDLE SOURCES              ##
  //#############################################

  handle () {

    /* abort sending while first fetch or lock until message is send */
    if (this.wait && this.busy)
   	 return null;

     /* if (this.wait) */
       this.busy = true;

    let self = this;
    var data = []

    self.sources.forEach(func => {
      func().then(result => {
      data.push(result);
         if (data.length == self.sources.length)
         self.attachToTangle(data);
     }).catch(err => { console.error(err); });
    })

  }

  //#############################################
  //##            ATTACH TO TANGLE             ##
  //#############################################

  attachToTangle (_data) {

   const scope = this;
   const time = Date.now();
   const ts = '\x1b[94m' + time + '\x1b[0m ';

   let json = {
      'id':         this.id,
      'location':   this.location,
      'timestamp':  time,
      'data':       _data,
   }

   console.log('\nJSON (\x1b[94mTangle\x1b[0m):')
   console.log(json);

   let trytes = this.iota.utils.toTrytes(JSON.stringify(json));
   //console.log("\nTRYTES:\n" + trytes);

   console.log('\n\x1b[93m[attaching ' + time + ']\x1b[0m\n');

   var transfersArray = [{
         'address': this.rec_address,
         'value': 0,
         'message': trytes,
         'tag': this.tag
     }]

     /* PREPARE TRANSFERS */
     this.iota.api.prepareTransfers(this.seed, transfersArray, function(err, bundle) {

       if (err) {
         console.log(ts + '\x1b[41mERROR\x1b[0m (' + err + ')');
         return -1;
       } else {

         /* PUSH TO TANGLE */
         scope.iota.api.sendTrytes(bundle, scope.depth, 14, function(err, result) {

             if (err) {
               console.log(ts + '\x1b[41mERROR\x1b[0m (' + err + ')');
               return -2;
             } else {
               console.log(ts + '\x1b[32mATTACHED (hash: ' + result[0].hash + ')\x1b[0m');
               /* if (scope.wait) */
          	    scope.busy = false;
             }
         })

       }

     })

  }

  //#############################################
  //##                 HELPER                  ##
  //#############################################

  generateSeed () {

   var seed = "";
   var trytes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";

   for (var i = 0; i < 81; i++)
     seed += trytes.charAt(Math.floor(Math.random() * trytes.length));

   return seed;
  }

}

//#############################################
//##                   EXPORTS               ##
//#############################################

module.exports = STREAM;
