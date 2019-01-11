'use strict'

const sinon = require('sinon')
const chai = require('chai')
const chaiSinon = require('chai-sinon')
const { control, cold, hot, hotRefCount } = require('./')

const { expect } = chai
chai.use(chaiSinon)

function assertExpectedCalls(spy, expected) {
  expect(spy).to.have.callCount(expected.length)
  expected.forEach(entry => {
    expect(spy).to.have.been.calledWith(entry)
  })
}

console.warn('⚠️️\tTHIS MAY FAIL ON SLOWER CPU')

describe('Observables', () => {
  let spy

  beforeEach(() => {
    spy = sinon.spy(console, 'log')
  })

  afterEach(() => {
    console.log.restore()
  })

  it('should satisfy control case', () => {
    return control()
      .then(assertExpectedCalls.bind(null, spy, control.expected))
  })

  it('should satisfy cold observable case', () => {
    return cold()
      .then(assertExpectedCalls.bind(null, spy, cold.expected))
  })

  it('should satisfy hot observable case', () => {
    return hot()
      .then(assertExpectedCalls.bind(null, spy, hot.expected))
  })

  it('should satisfy hot observable using refCount case', () => {
    return hotRefCount()
      .then(assertExpectedCalls.bind(null, spy, hotRefCount.expected))
  })

})
