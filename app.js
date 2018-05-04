const STREAM = require('./utils/stream');
const MAM_STREAM = require('./utils/stream_mam');

const timeout = (process.argv[2] >= 0 ? process.argv[2] : 60);
                           /* depends on node performance ^^ */
var streams = [];

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
streams.push(new MAM_STREAM ({
  'host': 'http://0.0.0.0',
  'port':  14265,
  'id':   'SensorNode (MAM)',
  'location':  'Home',
}))

/* TANGLESTREAM */
/*
streams.push(new STREAM ({
  'host': 'http://0.0.0.0',
  'port':  14265,
  'id':   'SensorNode',
  'location':  '52.26°N 13.42°E',
  'tag':  'SENSORNODEROCKS',
  'depth': 3
}))
*/

streams[0].addSource(readSensor);
// streams[1].addSource(readSensor);

//#############################################
//##              EXECUTION HEAD             ##
//#############################################

console.log('\n╔════════════════════════════╗');
console.log('║       SensorNode v1.2      ║');
console.log('╚════════════════════════════╝');
console.log();
console.log('Timeout: ' + timeout + ' sec');
console.log('Streams: ' + streams.length);

function run () {

 streams.forEach(stream => {
   stream.handle();
 })

 setTimeout(run, timeout*1000);
}

/* start */
run();
