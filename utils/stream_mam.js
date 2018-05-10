//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('iota.lib.js');
let MAM = require('mam.node.js');

//#############################################
//##          MAMSTREAM CONSTRUCTOR          ##
//#############################################

class MAM_STREAM {

  constructor (_stream) {

    this.iota = new IOTA({
        'host': _stream.host || '0.0.0.0',
        'port': _stream.port || 14265
    });

    this.id = _stream.id || 'SensorNode';
    this.location = _stream.location || {'lat': 40.65, 'lng': -73.91};
    this.sources = [];

    this.seed = _stream.seed || this.generateSeed();
    this.tree = null;

    this.wait = (_stream.wait == false ? false : true);	/* discards packets till the current packet has been send */
    this.fetch = (_stream.fetch == true ? true : false);	/* enables permanent fetching*/
    this.busy = false;
    this.sync = false;

    // Initiate the mam state with the given seed at index 0.
    this.mamState = MAM.init(this.iota, this.seed, 2, 0);
    /* mamState = MAM.changeMode(mamState, 'restricted', password) */
  }

  //#############################################
  //##            ADD DATA SOURCE              ##
  //#############################################

  addSource (_s) {
    this.sources.push(_s);
  }

  //#############################################
  //##              HANDLE SOURCES             ##
  //#############################################

  handle () {

    /* abort sending while first fetch or lock until message is send */
    if (this.sync || (this.wait && this.busy))
   	 return null;

    /* if (this.wait) */
      this.busy = true;

    let self = this;
    var data = []

    self.sources.forEach(func => {
      func().then(result => {
      data.push(result);
         if (data.length == self.sources.length)
         	self.send(data);
     }).catch(err => { console.error(err); });
    })

  }

  //#############################################
  //##              INITIATE MAM               ##
  //#############################################

  send (_data) {

   const scope = this;
   const time = Date.now();
   const ts = '\x1b[95m' + time + '\x1b[0m ';

   let json = {
  	'id':         this.id,
  	'location':   this.location,
  	'timestamp':  time,
  	'data':       _data,
    }

   // Fetch all the messages in the stream.
   this.fetchCount(json, scope).then(v => {

     /* finished fetching up */
     this.sync = false;

     this.mamState = MAM.init(this.iota, this.seed, 2, v.messages.length);
     /* mamState = MAM.changeMode(mamState, 'restricted', password) */

     this.publish(json, scope).then(result => {

       console.log(ts + '\x1b[32mSENT (hash: ' + result[0].hash + ')\x1b[0m');

       /* if (scope.wait) */
  	  scope.busy = false;

     }).catch(err => { console.error(ts + '\x1b[41mERROR\x1b[0m (' + err + ')'); })

   }).catch(err => { console.error(ts + '\x1b[41mERROR\x1b[0m (' + err + ')'); });

  }

  //#############################################
  //##                  MaM                    ##
  //#############################################

  async fetchCount (_json, _scope) {

      let trytes = _scope.iota.utils.toTrytes('START');
      let message = MAM.create(_scope.mamState, trytes);

      if (_scope.tree == null) {

        console.log('\n\x1b[45mThe first root:\x1b[0m');
        console.log(message.root);
        _scope.sync = true;

      } else { ++_scope.tree.messages.length; }

      console.log('\nJSON (\x1b[95mMaM\x1b[0m):');
      console.log(_json);
      console.log();

      if (_scope.fetch || _scope.tree == null) {
  	 // Fetch all the messages upward from the first root.
  	 console.log('\x1b[93m[fetching]\x1b[0m');
  	 _scope.tree = await MAM.fetch(message.root, 'public', null, null);
  	 /* _scope.tree = await MAM.fetch(message.root, 'restricted', password, null); */
      }

      return _scope.tree;
  }

  async publish (_json, _scope) {

      let packet = JSON.stringify(_json);

      let trytes = _scope.iota.utils.toTrytes(packet)
      let message = MAM.create(_scope.mamState, trytes);
      // Set the mam state so we can keep adding messages.
      _scope.mamState = message.state;
      // Attach the message.
      console.log('\x1b[93m[sending ' + _json.timestamp +']\x1b[0m\n');
      return await MAM.attach(message.payload, message.address);
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

module.exports = MAM_STREAM;
