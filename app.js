const SENSORSTREAM = require('./util/sensorstream');

//#############################################
//##	      	  SETUP SENSORS	 	     ##
//#############################################

/* pseudo functions */

async function getHumidity () {
	return await 37.2 + ' %RH';
}

async function getTemperature () {
	return await 22.0 + ' °C';
}

async function getPressure () {
	return await 933.0 + ' hPa';
}

//#############################################
//##              SETUP STREAMS              ##
//#############################################

var stream = [];

stream.push(new SENSORSTREAM ({
  'host': 'http://0.0.0.0',
  'port':  14265,
  'id':   'MySensorNode',
  'location':  '52.26°N 13.42°E',
  'tag':  'MYSENSORSTREAM999ONE'
}))

stream[0].addSource(getHumidity);
stream[0].addSource(getTemperature);
stream[0].addSource(getPressure);

//#############################################
//##              EXECUTION HEAD             ##
//#############################################

function run () {
  stream.forEach(function(s) {
    s.handle();
  })

  setTimeout(run, process.argv[2] || 5000);
}

/* start */
run();
