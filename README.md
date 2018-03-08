# SensorNode
SensoNode-client application for IOTA.

Either data is being pushed to <a href="https://thetangle.org/">Tangle</a> or send as <a href="https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e">Masked Authenticated Message</a>.

<hr>

<h3>Creating a stream:</h3>

<h5>First stream:<h5>
stream.push(new STREAM ({
  'host': 'http://[remote node / localhost]',
  'port':  [port]
  
  [OPTIONAL PARAMETERS]
  
}))

<h5>Second stream:<h5>
stream.push(new STREAM ({
  'host': 'http://[remote node / localhost]',
  'port':  [port]
  
  [OPTIONAL PARAMETERS]
  
}))

<h3>Add data sources:</h3>

stream[0].addSource(functionX);
stream[0].addSource(functionY);
stream[0].addSource(functionZ);

stream[1].addSource(functionFoo);
stream[1].addSource(functionBar);
