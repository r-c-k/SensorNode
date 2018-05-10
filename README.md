# SensorNode
SensorNode-client application for [IOTA](http://iota.org).

Either data is being pushed to [Tangle](https://thetangle.org/) or send as [Masked Authenticated Message](https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e), or both.

<img src="https://i.imgur.com/CUu49Y3.jpg"/>

(*Image by [Wyn Tiedmers](https://www.wynt.de/)*)


### Creating streams:

You can create streamobjects with the following parameters:

###### Parameters:
Parameter | Function | Default
------------ | ------------- | -------------
host | (Remote-) node we're connecting to. | 0.0.0.0
port | Iota-api port on the node. | 14265
id | Identifies the streamobject. | "SensorNode"
location | Nodes location, eg. 'lat': 52.26 'lng': 13.42. | {'lat': 40.65, 'lng': -73.91}
seed | Seed for creating transactions/MAM-messages. | [generated]
rec | Receiving address (tanglestream only). | "GPB9PBNCJTPGF..."
tag | Tag for Transactions (tanglestream only). | "SENSORNODEROCKS"
depth | Depth for tip-selection (tanglestream only). | 3
wait | Discards packets till the current packet has been send. | true
fetch | Enable continuous fetching from MAM-root when multiple nodes stream from the same seed (mamstream only).| false

#### First Stream (TANGLE):
```
streams.push(new STREAM ({
  'host': 'http://[remote node / localhost]',
  'port':  [port]

  [OPTIONAL PARAMETERS]

}))
```

#### Second Stream (MAM):
```
streams.push(new MAM_STREAM ({
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
streams[0].addSource(functionFoo);
streams[0].addSource(functionBar);

streams[1].addSource(functionX);
streams[1].addSource(functionY);
streams[1].addSource(functionZ);
```

## Cool! Whats next?

Run with ``` node app [delay] ``` where delay specifies a timeout between each push (default 60 seconds).

Thats it. Have fun providing data over the iota protocol. ;)

## You want to donate?

IOTA: VDBFANNKXHJU9EUJESQAANDFIGRNXYIQ9IJWZZO9AOHCQYBDXVRUBNLFATXDW9IMTSKBWESBAKDMMO9NX
