const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

const express = require('express')
const server = proxyquire('../../server', {
  'express': () => { return 'foo' }
})

describe('server', () => {
  it('', () => {
    //WHEN
    server.start()

    //THEN
    expect()


  })

  describe('app', () => {
    it('should be an express instance', () => expect(server.app).to.equals('foo'))
  })
  describe('.start()', () => {

  })
})
