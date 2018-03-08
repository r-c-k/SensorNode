# SensorNode
SensoNode-client application for IOTA.

Either data is being pushed to <a href="https://thetangle.org/">Tangle</a> or send as <a href="https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e">Masked Authenticated Message</a> (or both).

### Creating a stream:

#### First Stream:
```
stream.push(new STREAM ({
  'host': 'http://[remote node / localhost]',
  'port':  [port]
  
  [OPTIONAL PARAMETERS]
  
}))
```

#### Second Stream:
```
stream.push(new STREAM ({
  'host': 'http://[remote node / localhost]',
  'port':  [port]
  
  [OPTIONAL PARAMETERS]
  
}))
```

#### Add data sources
```
stream[0].addSource(functionX);
stream[0].addSource(functionY);
stream[0].addSource(functionZ);

stream[1].addSource(functionFoo);
stream[1].addSource(functionBar);
```

## Cool! Whats next?

Thats it. Have fun providing your sensor data over the iota protocol. ;)
