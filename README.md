# helium-mqtt-adapter

`helium-mqtt-adapter` is a service that bridges incoming MQTT data to the Streamr Network. It listens for incoming messages on the MQTT port (tcp port 1883) by default.

In the future, it's possible to simply run a Streamr Broker node, which ships with an MQTT interface. But for the time being, use this adapter to connect data from Helium to Streamr.

An Ethereum private key is used to authenticate to Streamr Network. You can export your private key from your [MetaMask wallet](https://metamask.io/), or generate a new address/key pair with one of the many tools available, such as [this one](https://vanity-eth.tk/).

## Install

Prerequisites: Node `v14.x` and npm.

Clone this repo and then run
```
npm ci
```

## Configure

Define the environment variables, e.g. in a `.env` file in the application root directory.

```
PRIVATE_KEY=0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
USERNAME=user
PASSWORD=secret
```

USERNAME and PASSWORD are optional parameters. If defined, the client must authenticate with the credentials when it connects to the server. The credentials can be passed in the MQTT url: `mqtt://username:password@adapter-ip-address`.

STREAM_ID_DOMAIN is optional parameter that comes in handy if the MQTT topic space being used is not tailored for use with Streamr. If defined, all topics are mapped to streamIds by prepending the domain to the topic: `STREAM_ID_DOMAIN + / + mqtt_topic`. With Helium, this isn't usually needed, as the MQTT integration in the Helium Console can be configured with the stream id as-is.

## Run

Start the application

```
npm start
```

## Develop

Run tests
```
npm test
```
