//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('../node_modules/iota.lib.js/lib/iota');
let MAM = require('./mam.node.js');

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

  this.mamState = null;
  this.fetching = _stream.fetching || false;
  this.syncing = false;
  this.tree = null;

  this.initNode();
}

//#############################################
//##            ADD DATA SOURCE              ##
//#############################################

STREAM.prototype.addSource = function(_s) {
  this.sources.push(_s);
}

//#############################################
//##              HANDLE SOURCES             ##
//#############################################

STREAM.prototype.handle = function() {

  let self = this;
  var data = []

  self.sources.forEach(function(s) {
    s().then(result => {
    data.push(result);
       if (data.length == self.sources.length)
       	self.send(data);
   }).catch(err => { console.error(err); });
  })

}

//#############################################
//##              INITIATE MAM               ##
//#############################################

STREAM.prototype.send = function(_data) {

 /* abort sending while first fetch */
 if (this.syncing == true)
 	 return;

 const scope = this;
 const time = Date.now();

 let json = {
	'id':         this.id,
	'location':   this.location,
	'timestamp':  time,
	'data':       _data,
  }

 // Initiate the mam state with the given seed at index 0.
 this.mamState = MAM.init(this.iota, this.seed, 2, 0);
 //mamState = MAM.changeMode(mamState, 'restricted', password)

 // Fetch all the messages in the stream.
 fetchCount(json, scope).then(v => {

   /* finished fetching up */
   this.syncing = false;

   // Log the messages.
   let count = v.messages.length;

   // To add messages at the end we need to set the startCount for the mam state to the current amount of messages.
   this.mamState = MAM.init(this.iota, this.seed, 2, count);
   //mamState = MAM.changeMode(mamState, 'restricted', password)

   let newMessage = JSON.stringify(json);

   publish(newMessage, scope).then(res => {
	   
   	console.log('\x1b[32mMESSAGE (@ ' + time + ') SENT\x1b[0m');
	   
   }).catch(err => { console.log('\x1b[41mERROR\x1b[0m (' + err + ')'); })
	 
 }).catch(err => { console.log(err); });

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

//#############################################
//##                  MaM                    ##
//#############################################

async function fetchCount(_json, _scope){
    let trytes = _scope.iota.utils.toTrytes('START');
    let message = MAM.create(_scope.mamState, trytes);

    if (_scope.tree == null) {

      console.log('\n\x1b[45mThe first root:\x1b[0m');
      console.log(message.root);
      _scope.syncing = true;

    } else { ++_scope.tree.messages.length; }

    console.log('\nJSON:');
    console.log(_json);
    console.log();

    if (_scope.fetching || _scope.tree == null) {
	 // Fetch all the messages upward from the first root.
	 console.log('\x1b[93m[fetching]\x1b[0m');
	 _scope.tree = await MAM.fetch(message.root, 'public', null, null);
	 //_scope.tree = await MAM.fetch(message.root, 'restricted', password, null);
    }

    return _scope.tree;
}

async function publish(_packet, _scope){
    // Create the message.
    let trytes = _scope.iota.utils.toTrytes(_packet)
    let message = MAM.create(_scope.mamState, trytes);
    // Set the mam state so we can keep adding messages.
    _scope.mamState = message.state;
    // Attach the message.
    console.log('\x1b[93m[sending]\x1b[0m\n');
    return await MAM.attach(message.payload, message.address);
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
