'use strict'

const Rx = require('rxjs')

// Control
exports.control = () => {

  return new Promise(resolve => {
    const source = Rx.Observable.interval(100)

    const subscription1 = source.subscribe(
      x => console.log(`Observer 1: onNext: ${x}`),
      e => console.log(`Observer 1: onError: ${e.message}`),
      () => console.log('Observer 1: onCompleted')
    )

    const subscription2 = source.subscribe(
      x => console.log(`Observer 2: onNext: ${x}`),
      e => console.log(`Observer 2: onError: ${e.message}`),
      () => console.log('Observer 2: onCompleted')
    )

    setTimeout(() => {
      subscription1.unsubscribe()
      subscription2.unsubscribe()
      resolve()
    }, 500)
  })
}
exports.control.expected = `
Observer 1: onNext: 0
Observer 2: onNext: 0
Observer 1: onNext: 1
Observer 2: onNext: 1
Observer 1: onNext: 2
Observer 2: onNext: 2
Observer 1: onNext: 3
Observer 2: onNext: 3
`.split('\n').slice(1, -1)

// Cold Observable
exports.cold = () => {

  return new Promise(resolve => {
    const source = Rx.Observable.interval(100)
    let subscription1, subscription2

    // No value is pushed to 1st subscription at this point
    subscription1 = source.subscribe(
      x => console.log(`Observer 1: onNext: ${x}`),
      e => console.log(`Observer 1: onError: ${e.message}`),
      () => console.log('Observer 1: onCompleted')
    )

    // Idle for 300 ms
    setTimeout(connectSubscription2, 300)

    function connectSubscription2() {
      subscription2 = source.subscribe(
        x => console.log(`Observer 2: onNext: ${x}`),
        e => console.log(`Observer 2: onError: ${e.message}`),
        () => console.log('Observer 2: onCompleted')
      )

      // Disconnect after 300 ms
      setTimeout(disconnect, 300)
    }

    function disconnect() {
      subscription1.unsubscribe()
      subscription2.unsubscribe()
      resolve()
    }
  })
}
exports.cold.expected = `
Observer 1: onNext: 0
Observer 1: onNext: 1
Observer 1: onNext: 2
Observer 2: onNext: 0
Observer 1: onNext: 3
Observer 2: onNext: 1
Observer 1: onNext: 4
`.split('\n').slice(1, -1)

// Hot Observable
exports.hot = () => {

  return new Promise(resolve => {
    const source = Rx.Observable.interval(100)
    let subscription1, subscription2

    // Convert the sequence into a hot sequence
    const hot = source.publish()

    // Connect hot to source
    // and start streaming to subscribers
    hot.connect()

    subscription1 = hot.subscribe(
      x => console.log(`Observer 1: onNext: ${x}`),
      e => console.log(`Observer 1: onError: ${e.message}`),
      () => console.log('Observer 1: onCompleted')
    )

    // Idle for 300 ms
    setTimeout(connectSubscription2, 300)

    function connectSubscription2() {
      subscription2 = hot.subscribe(
        x => console.log(`Observer 2: onNext: ${x}`),
        e => console.log(`Observer 2: onError: ${e.message}`),
        () => console.log('Observer 2: onCompleted')
      )

      // Disconnect after 300 ms
      setTimeout(disconnect, 300)
    }

    function disconnect() {
      subscription1.unsubscribe()
      subscription2.unsubscribe()
      resolve()
    }
  })
}
exports.hot.expected = `
Observer 1: onNext: 0
Observer 1: onNext: 1
Observer 1: onNext: 2
Observer 2: onNext: 2
Observer 1: onNext: 3
Observer 2: onNext: 3
Observer 1: onNext: 4
Observer 2: onNext: 4
`.split('\n').slice(1, -1)

// Hot Observable using refCount
exports.hotRefCount = () => {

  return new Promise(resolve => {
    const source = Rx.Observable.interval(100)
    let subscription1, subscription2, subscription3

    // Convert the sequence into a hot sequence
    const hot = source.publish().refCount()

    subscription1 = hot.subscribe(
      x => console.log(`Observer 1: onNext: ${x}`),
      e => console.log(`Observer 1: onError: ${e.message}`),
      () => console.log('Observer 1: onCompleted')
    )

    // Idle for 300 ms
    setTimeout(connectSubscription2, 300)

    function connectSubscription2() {
      subscription2 = hot.subscribe(
        x => console.log(`Observer 2: onNext: ${x}`),
        e => console.log(`Observer 2: onError: ${e.message}`),
        () => console.log('Observer 2: onCompleted')
      )

      // Disconnect then reconnect after 300 ms
      setTimeout(disconnectThenReconnect, 300)
    }

    function disconnectThenReconnect() {
      subscription1.unsubscribe()
      subscription2.unsubscribe()

      subscription3 = hot.subscribe(
        x => console.log(`Observer 3: onNext: ${x}`),
        e => console.log(`Observer 3: onError: ${e.message}`),
        () => console.log('Observer 3: onCompleted')
      )

      // Disconnect finally after 300 ms
      setTimeout(disconnect, 300)
    }

    function disconnect() {
      subscription3.unsubscribe()
      resolve()
    }
  })
}
exports.hotRefCount.expected = `
Observer 1: onNext: 0
Observer 1: onNext: 1
Observer 1: onNext: 2
Observer 2: onNext: 2
Observer 1: onNext: 3
Observer 2: onNext: 3
Observer 1: onNext: 4
Observer 2: onNext: 4
Observer 3: onNext: 0
Observer 3: onNext: 1
`.split('\n').slice(1, -1)
