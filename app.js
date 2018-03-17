const STREAM = require('./utils/stream');
const MAM_STREAM = require('./utils/stream_mam');

const timeout = (process.argv[2] >= 0 ? process.argv[2] : 60);
                           /* depends on node performance ^^ */
var stream = [];

//#############################################
//##	      	  SETUP SENSORS	 	     ##
//#############################################

/* example function */

async function readSensor () {

	let h = (Math.random() * (50.0 - 30.0) + 30.0).toFixed(2) + ' %RH';
	let t = (Math.random() * (30.0 - 20.0) + 20.0).toFixed(2) + ' °C';
	let p = (Math.random() * (1000.0 - 900.0) + 900.0).toFixed(2) + ' hPa';
	let g = (Math.random() * (35000.0 - 25000.0) + 25000.0).toFixed(2) + ' Ohms';

	let json = {
		'humidity': h,
		'temperature': t,
		'pressure': p,
		'gasResistance': g
	}

	return await json;
}

//#############################################
//##              SETUP STREAMS              ##
//#############################################

/* MAMSTREAM */
stream.push(new MAM_STREAM ({
  'host': 'http://localhost',
  'port':  14265,
  'id':   'SensorNode1',
  'location':  'Home',
}))

/* TANGLESTREAM */
/*
stream.push(new STREAM ({
  'host': 'http://localhost',
  'port':  14265,
  'id':   'SensorNode2',
  'location':  '52.26°N 13.42°E',
  'tag':  'SENSORNODEROCKS',
  'depth': 3
}))
*/

stream[0].addSource(readSensor);
// stream[1].addSource(readSensor);

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
