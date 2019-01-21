# Planning Poker

[![Build Status](https://travis-ci.org/chrisandrews7/planning-poker.server.svg?branch=master)](https://travis-ci.org/chrisandrews7/planning-poker.server) [![Coverage Status](https://coveralls.io/repos/github/chrisandrews7/planning-poker.server/badge.svg?branch=master)](https://coveralls.io/github/chrisandrews7/planning-poker.server?branch=master)

## About

Server for a Sprint planning tool to make agile estimating and planning faster and more efficient.  

Built using socket.io, acting as a broker for communication between players.

## Getting Started

Install dependencies
```
npm install
```

Running
```
npm start
```

## Environment Variables
- **PORT**: Port to run on. *Optional*, default `3000`.
- **CORS_WHITELIST**: Comma seperated list of URLS to whitelist for CORS. *Optional*, defaults to `*:*`.

## Testing

Run all tests
```
npm test
```

Run unit tests
```
npm run test:unit
```

Run integration tests
```
npm run test:integration
```
