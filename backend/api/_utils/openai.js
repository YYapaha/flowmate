'use strict';

const OpenAI = require('openai');

let _client;

function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

module.exports = { getClient };
