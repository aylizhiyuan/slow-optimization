'use strict'
var Transform = require('stream').Transform
var morse = require('morse')

class Morsify extends Transform {
  constructor(options) {
    super(options)
  }
  _transform(chunk, encoding, callback) {
    const word = chunk.toString().toUpperCase()
    this.push(morse.encode(word) + '\n\n')
    callback()
  }
}

process.stdin
  .pipe(Transform({
    objectMode: true,
    transform: function (chunk, encoding, callback) {
      callback(null, chunk.toString().replace(/\n/g, ''))
    }
  }))
  .pipe(new Morsify())
  .pipe(process.stdout)