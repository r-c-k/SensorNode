# SensorNode
SensorNode-client application for [IOTA](http://iota.org).

Either data is being pushed to [Tangle](https://thetangle.org/) or send as [Masked Authenticated Message](https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e) (or both).

### Creating streams:

You can create streamobjects with the following parameters:

###### Parameters:
Parameter | Function | Default
------------ | ------------- | -------------
host | (Remote-) node we're connecting to. | localhost
port | Iota-api port on the node | 14265
id | Identifies the streamobject | "MyNode"
location | Nodes location, eg. "Home" or "52.26°N 13.42°E" | "Home"
seed | Seed for creating transactions/MAM-messages | [generated]
rec | Receiving address (tanglestream only) | "GPB9PBNCJTPGF..."
tag | Tag for Transactions (tanglestream only) | "TANGLESTREAM"
fetching | Enable continuous fetching from MAM-root when multiple nodes stream from the same seed. (mamstream only)| false

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

Data sources are (async) functions which return the data you want to stream,
eg:

```
async function functionFoo () {
	return await sensor.read();
}
```
```
stream[0].addSource(functionFoo);
stream[0].addSource(functionBar);

stream[1].addSource(functionX);
stream[1].addSource(functionY);
stream[1].addSource(functionZ);
```

## Cool! Whats next?

Thats it. Have fun providing data over the iota protocol. ;)
