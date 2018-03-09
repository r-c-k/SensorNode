//#############################################
//##                  SETUP                  ##
//#############################################

let IOTA = require('../node_modules/iota.lib.js/lib/iota');
let MAM = require('./mam.node.js');

let mamState = null;

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

  this.initNode();
}

//#############################################
//##            ADD DATA SOURCE              ##
//#############################################

STREAM.prototype.addSource = function(_f) {
  this.sources.push(_f);
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
//##             INITIATE MAM                ##
//#############################################

STREAM.prototype.send = function(_data) {

let json = {
    'id':         this.id,
    'location':   this.location,
    'timestamp':  Date.now() / 1000 | 0,
    'data':       _data,
 }

 console.log("\nJSON:");
 console.log(json);

 console.log('\n[sending]\n');

 // Initiate the mam state with the given seed at index 0.
 mamState = MAM.init(this.iota, this.seed, 2, 0);
 //mamState = MAM.changeMode(mamState, 'restricted', password)

 // Save scope
 const scope = this;

 // Fetch all the messages in the stream.
 fetchStartCount(scope).then(v => {
     // Log the messages.
     let startCount = v.messages.length;

     // To add messages at the end we need to set the startCount for the mam state to the current amount of messages.
     mamState = MAM.init(this.iota, this.seed, 2, startCount);
     //mamState = MAM.changeMode(mamState, 'restricted', password)

 	   let newMessage = Date.now() + ' ' + JSON.stringify(json);

     // Now the mam state is set, we can add the message.
     publish(newMessage, scope);
 }).catch(ex => {
     console.log(ex);
 });

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
//##                  MaM                    ##
//#############################################

async function fetchStartCount(scope){
    let trytes = scope.iota.utils.toTrytes('START');
    let message = MAM.create(mamState, trytes);
    console.log('The first root:');
    console.log(message.root);
    console.log();
    // Fetch all the messages upward from the first root.
    return await MAM.fetch(message.root, 'public', null, null);
    //return await MAM.fetch(message.root, 'restricted', password, null);
}

async function publish(packet, scope){
    // Create the message.
    let trytes = scope.iota.utils.toTrytes(JSON.stringify(packet))
    let message = MAM.create(mamState, trytes);
    // Set the mam state so we can keep adding messages.
    mamState = message.state;
    // Attach the message.
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
