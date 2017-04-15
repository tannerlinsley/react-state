import React, { Component } from 'react'
//
import { Provider, Connect } from '../src'
import sourceTxt from '!raw-loader!./Demo.js'
//
import CodeHighlight from './components/codeHighlight.js'

const boxStyle = {
  margin: '10px',
  border: '5px solid black',
  borderRadius: '5px',
  padding: '10px'
}

// ################
// FooComponent
// ################

// FooComponent is pretty simple. It subscribes to,
// and displays the 'foo' value from the provider.
class FooComponent extends Component {
  render () {
    const {
      foo,
      children
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>Foo: {foo}</div>
        {children}
      </div>
    )
  }
}
// FooComponent needs access to 'foo', so we'll subscribe to it.
const ConnectedFooComponent = Connect(state => ({
  foo: state.foo
}))(FooComponent)

// ################
// BarComponent
// ################

// BarComponent is pretty simple. It subscribes to,
// and displays the 'bar' value from the provider.
class BarComponent extends Component {
  render () {
    const {
      bar,
      children
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>Bar: {bar}</div>
        {children}
      </div>
    )
  }
}
// BarComponent needs access to 'bar', so we'll subscribe to it.
const ConnectedBarComponent = Connect(state => ({
  bar: state.bar
}))(BarComponent)

// ################
// FooBarComponent
// ################

// FooBarComponent is very similar.
// It displays both the foo' and 'bar' props
class FooBarComponent extends Component {
  render () {
    const {
      foo,
      bar
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>Foo: {foo}</div>
        <div>Bar: {bar}</div>
      </div>
    )
  }
}
// FooBarComponent needs access to 'foo' and 'bar', so we'll subscribe to both of them.
const ConnectedFooBarComponent = Connect(state => ({
  foo: state.foo,
  bar: state.bar
}))(FooBarComponent)
// Now, any time the 'foo' or 'bar' values change, FooBarComponent will rerender :)

// ################
// BazComponent
// ################

// The BazComponent shows whether the 'baz' value is
// greater than 5 and also displays a message.
class BazComponent extends Component {
  render () {
    const {
      bazIsFourth,
      message
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>Baz is a multiple of 4: {bazIsFourth.toString()}</div>
        <div>Message: {message}</div>
      </div>
    )
  }
}
// This time, we are going to return a calculated value.
const ConnectedBazComponent = Connect(state => {
  return ({
    bazIsFourth: state.baz % 4 === 0
    // Since 'bazIsFourth' will be a boolean, we don't need to use a memoized value,
    // But if it was a non-primitive, a selector or memoized value is
    // recommended for performance. For an excellent solution, visit https://github.com/reactjs/reselect
  })
})(BazComponent)
// Now, our BazComponent will only update when the bazIsFourth value changes!

// ################
// ControlComponent
// ################

// ControlComponent contains a few buttons that will change
// different parts of our state.
class ControlComponent extends Component {
  render () {
    const {
      dispatch // this callback is provided to every Connected component
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>
          Foo: &nbsp;
          <button
            // 'dispatch' is called with function that is passed the
            // current provider state, and returns the new Provider
            // state. Immutability should be obvserved and maintained
            // here, just as you would with this.setState or redux reducers
            onClick={() => dispatch(state => ({
              ...state,
              foo: state.foo - 1
            }))}
          >
            -
          </button>
          <button
            onClick={() => dispatch(state => ({
              ...state,
              foo: state.foo + 1
            }))}
          >
            +
          </button>
        </div>
        <div>
          Bar: &nbsp;
          <button
            onClick={() => dispatch(state => ({
              ...state,
              bar: state.bar - 1
            }))}
          >
            -
          </button>
          <button
            onClick={() => dispatch(state => ({
              ...state,
              bar: state.bar + 1
            }))}
          >
            +
          </button>
        </div>
        <div>
          Baz: &nbsp;
          <button
            onClick={() => dispatch(state => ({
              ...state,
              baz: state.baz - 1
            }))}
          >
            -
          </button>
          <button
            onClick={() => dispatch(state => ({
              ...state,
              baz: state.baz + 1
            }))}
          >
            +
          </button>
        </div>
      </div>
    )
  }
}
// The control component doesn't depend on any state, but
// we still Connect it se we can use the 'dispatch' prop
const ConnectedControlComponent = Connect()(ControlComponent)

// ################
// Reusable Component
// ################

// Now let's create our our reusable component.
// We need to keep track of state in our component,
// and your first instinct might be to use local state
// to accomplish this. Interestingly enough though,
// we would probably end up passing many pieces of the state
// down to child components via props and, likewise, would need to
// pass callbacks with them so our child components could
// update the state.

// We need a better state management system for our component than
// local state, but nothing that will require including a state
// manager like redux or MobX.

// This is where Provider comes in!

// Provider is used as a higher order component or decorator
class MyAwesomeReusableComponent extends Component {
  render () {
    // Components that are wrapped with Provider automatically
    // receive the entire provider state as props.
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        Current Props:
        <br />
        <br />
        <CodeHighlight>{() => JSON.stringify(this.props, null, 2)}</CodeHighlight>
        <br />
        <ConnectedFooComponent>
          <ConnectedBarComponent>
            <ConnectedBazComponent
              message='Hi there!' // You can continue to pass props as normal :)
            />
          </ConnectedBarComponent>
        </ConnectedFooComponent>
        <ConnectedFooBarComponent />
        <ConnectedControlComponent />
      </div>
    )
  }
}
// Just pass Provider a component you would like to wrap and an optional config object
// In the config, we can supply an 'initial' state for the Provider
const ProvidedMyAwesomeReusableComponent = Provider(MyAwesomeReusableComponent, {
  initial: {
    baz: 3
  }
})

class Demo extends Component {
  constructor () {
    super()
    this.state = getRandomFooBar()
  }
  render () {
    const {
      foo,
      bar
    } = this.state
    return (
      // Let's use our awesome reusable component with some props!
      <div>
        To aid in visualizing performance, each of our components has a border that changes every time it rerenders.
        <br />
        <br />
        Initial state for MyAwesomeReusableComponent:
        <br />
        <br />
        <CodeHighlight>{() => JSON.stringify({
          baz: 3
        }, null, 2)}</CodeHighlight>
        <br />
        Current state given to MyAwesomeReusableComponent:
        <br />
        <br />
        <CodeHighlight>{() => JSON.stringify(this.state, null, 2)}</CodeHighlight>
        <br />
        <button
          onClick={() => this.setState(state => getRandomFooBar())}
        >
          Randomize State
        </button>
        <br />
        <ProvidedMyAwesomeReusableComponent
          // Any props passed to our Provider-wrapped component will always be merged
          // onto the internal state
          foo={foo}
          bar={bar}
        />
        <CodeHighlight>{() => sourceTxt}</CodeHighlight>
      </div>
    )
  }
}

export default () => <Demo />

function getRandomFooBar () {
  return {
    foo: Math.ceil(Math.random() * 10),
    bar: Math.ceil(Math.random() * 5)
  }
}

function makeRandomColor () {
  return `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`
}
