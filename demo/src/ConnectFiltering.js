import React, { Component } from 'react'
//
import { Provider, Connect } from '../src'
import sourceTxt from '!raw-loader!./ConnectFiltering.js'
//
import CodeHighlight from './components/codeHighlight.js'

const boxStyle = {
  margin: '10px',
  borderRadius: '5px',
  padding: '10px',
  color: 'white',
  fontWeight: 'bolder',
  textShadow: '0 0 10px black'
}

class ExpensiveValue extends Component {
  render () {
    return (
      <div style={{
        ...boxStyle,
        background: makeRandomColor()
      }}>
        <div>ExpensiveValue: {JSON.stringify(this.props.foo)}</div>
      </div>
    )
  }
}

class Position extends Component {
  render () {
    return (
      <div style={{
        ...boxStyle,
        background: makeRandomColor()
      }}>
        <div>Position: {JSON.stringify(this.props.position)}</div>
      </div>
    )
  }
}

class Hover extends Component {
  render () {
    return (
      <div style={{
        ...boxStyle,
        background: makeRandomColor(),
        width: '400px',
        height: '300px'
      }}
        onMouseMove={e => this.props.dispatch(state => ({
          ...state,
          position: {
            x: e.clientX,
            y: e.clientY
          }
        }), {
          type: 'fromCursor'
        })}
      >
        Open your console and move your mouse around in here.
        <br />
        See how the only connect function that runs is the "Position" component?
      </div>
    )
  }
}

class ChangeExpensiveValue extends Component {
  render () {
    return (
      <div style={{
        ...boxStyle,
        background: makeRandomColor()
      }}>
        <div>
          <button
            onClick={() => this.props.dispatch(state => ({
              ...state,
              foo: Math.ceil(Math.random() * 10)
            }))}
          >
            Random ExpensiveValue
          </button>
        </div>
      </div>
    )
  }
}

const ConnectedExpensiveValue = Connect(state => {
  console.log('Running connect for "ExpensiveValue" component')
  // This is to simulate a lot of heavy connect functions
  let foo = 0
  for (var i = 0; i < 1000000000; i++) {
    foo = i
  }
  foo = state.foo
  return {
    foo: foo
  }
}, {
  filter: (oldState, newState, meta) => meta.type !== 'fromCursor'
})(ExpensiveValue)

const ConnectedPosition = Connect(state => {
  console.log('Running connect for "Position" component')
  return {
    position: state.position
  }
})(Position)

const ConnectedHover = Connect()(Hover)
const ConnectedChangeExpensiveValue = Connect()(ChangeExpensiveValue)

class ConnectFiltering extends Component {
  render () {
    return (
      <div>
        react-state is very good at change detection because of the way it can compare old and new states using Connect functions. But, whenever you dispatch an state change to your provider, EVERY connected component's subscribe function will run.
        <br />
        <br />
        If you are dispatching extremly rapidly, or having thousands of connected components, this can be extremely expensive, especially if you know beforehand that the subscribe function shouldn't even run!
        <br />
        <br />
        <ConnectedHover />
        <br />
        Now change ExpensiveValue to something random!
        <ConnectedChangeExpensiveValue />
        Notice how all of the connect functions ran this time!
        <ConnectedExpensiveValue />
        <ConnectedPosition />
        This is because of a special "filter" option we placed on the "ExpensiveValue" components' connect function:
        <CodeHighlight>{() => `
  const ConnectedExpensiveValue = Connect(state => {
    console.log('Running connect for "ExpensiveValue" component')
    // This is to simulate a lot of expensive connect functions
    let foo = 0
    for (var i = 0; i < 1000000000; i++) {
      foo = i
    }
    foo = state.foo
    return {
      foo: foo
    }
  }, {
    // This filter function guarantees that it will only if the meta of type does not equal 'fromCursor'.
    filter: (oldState, newState, meta) => meta.type !== 'fromCursor'
  })(ExpensiveValue)

  // Then, in our cursor move dispatcher we can include 'fromCursor' in the meta:
  this.props.dispatch(state => ({
    ...state,
    position: {
      x: e.clientX,
      y: e.clientY
    }
  }), {
    // This is the meta object
    type: 'fromCursor'
  })
        `}</CodeHighlight>
      </div>
    )
  }
}
// Just pass Provider a component you would like to wrap and an optional config object
// In the config, we can supply an 'initial' state for the Provider
const ProvidedConnectFiltering = Provider(ConnectFiltering, {
  initial: {
    foo: 1
  }
})

class Demo extends Component {
  render () {
    return (
      // Let's use our awesome reusable component with some props!
      <div>
        <ProvidedConnectFiltering />
        <br />
        <br />
        Here is the full source of the example:
        <CodeHighlight>{() => sourceTxt}</CodeHighlight>
      </div>
    )
  }
}

export default () => <Demo />

function makeRandomColor () {
  return `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`
}
