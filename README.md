# helium-mqtt-adapter

`helium-mqtt-adapter` stores a private key that is used to authenticate to Streamr
Network. This is a subject to change in the near future when integration can be
accomplished by simply running a Streamr Node instead of the
`helium-mqtt-adapter`.

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

USERNAME and PASSWORD are optional parameters. If defined, the client must authenticate with the credentials when it connects to the server.

STREAM_ID_DOMAIN is optional parameter. If defined, all topics are mapped to streamIds by prepending the domain to the topic: `STREAM_ID_DOMAIN + / + topic`.

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
