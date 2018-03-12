const STREAM = require('./utils/stream');
const MAM_STREAM = require('./utils/stream_mam');

const timeout = (process.argv[2] >= 0 ? process.argv[2] : 60);
			 										 /* depends on node performance ^^ */
var stream = [];

//#############################################
//##	      	  SETUP SENSORS	 	     ##
//#############################################

/* example functions */

async function getHumidity () {
	return await {'humidity' : '37.2 %RH'};
}

async function getTemperature () {
	return await {'temperature' : '22.0 °C'};
}

async function getPressure () {
	return await {'pressure' : '933 hPa'};
}

//#############################################
//##              SETUP STREAMS              ##
//#############################################

stream.push(new STREAM ({
  'host': 'http://localhost',
  'port':  14265,
  'id':   'SensorNode',
  'location':  '52.26°N 13.42°E',
  'tag':  'SENSORNODEROCKS', /* tanglestream */
  'depth': 3 /* tanglestream */
}))

/*

stream.push(new MAM_STREAM ({
  'host': 'http://localhost',
  'port':  14265,
  'id':   'SensorNode2',
  'location':  '22.14°N 51.23°E',
}))

*/

stream[0].addSource(getHumidity);
stream[0].addSource(getTemperature);
stream[0].addSource(getPressure);

// stream[1].addSource(getTemperature);

//#############################################
//##              EXECUTION HEAD             ##
//#############################################

console.log('\n╔════════════════════════════╗');
console.log('║       SensorNode v1.1      ║');
console.log('╚════════════════════════════╝');

console.log('\nTimeout: ' + timeout + ' sec');
console.log('Streams: ' + stream.length);

function run () {

 stream.forEach(function(s) {
   s.handle();
 })

 setTimeout(run, timeout*1000);
}

/* start */
run();
