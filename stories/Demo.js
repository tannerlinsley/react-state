import React, { Component } from 'react'
//
import { Provider, Connect } from '../src'
//
// import CodeHighlight from './components/codeHighlight.js'

const boxStyle = {
  margin: '10px',
  border: '5px solid black',
  borderRadius: '5px',
  padding: '10px'
}

// FooBarBazComponent is pretty simple.
// It displays it's 'foo' and 'bar' props
class FooBarBazComponent extends Component {
  render () {
    const {
      foo,
      bar,
      baz
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>Foo: {foo}</div>
        <div>Bar: {bar}</div>
        <div>Baz: {baz}</div>
      </div>
    )
  }
}
// FooBarBazComponent needs access to 'foo' and 'bar', so we'll subscribe to them.
const ConnectedFooBarBazComponent = Connect(state => ({
  foo: state.foo,
  bar: state.bar,
  baz: state.baz
}))(FooBarBazComponent)
// Now, any time the 'foo' or 'bar' values change, FooBarBazComponent will rerender :)

// FooComponent is very similar. It displays its 'foo' prop.
class FooComponent extends Component {
  render () {
    return (
      // Instead of connecting this component ahead of time though,
      // we can do it on the fly using Connect as a component in
      // conjunction with the 'subscribe' prop
      <Connect subscribe={(state) => ({
        foo: state.foo
      })}
      >
        {({
          foo // Now, any time 'foo' changes, our child function/component will update
        }) => {
          return (
            <div style={{
              ...boxStyle,
              borderColor: makeRandomColor()
            }}>
              <div>Foo: {foo}</div>
            </div>
          )
        }}
      </Connect>
    )
  }
}

// The BazComponent shows whether the 'baz' value is
// greater than 5 and also displays a message.
class BazComponent extends Component {
  render () {
    const {
      bazIsBig,
      message
    } = this.props
    return (
      <div style={{
        ...boxStyle,
        borderColor: makeRandomColor()
      }}>
        <div>Baz is > 5: {bazIsBig.toString()}</div>
        <div>Message: {message}</div>
      </div>
    )
  }
}
// This time, we are going to return a calculated value.
const ConnectedBazComponent = Connect(state => (state) => ({
  bazIsBig: state.baz > 5
  // Since 'bazIsBig' will be a boolean, we don't need to use a memoized value,
  // But if it was a non-primitive, a selector or memoized value is
  // recommended for performance. For an excellent solution, visit https://github.com/reactjs/reselect
}))(BazComponent)
// Now, our BazComponent will only update when the bazIsBig value changes!

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

// -------------------------------------------------'

// Now let's our top-level reusable component.
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

// There are 2 ways to use the Provider component:

// 1: As an inline component
class InlineMyAwesomeReusableComponent extends Component {
  render () {
    return (
      // If you use Provider as an inline component, any props you pass
      // will be used as the initial state for the Provider.
      <Provider
        // It's also important to note that if any of these
        // props change, the provider state will merged with
        // ALL of the props passed to the Provider
        baz={3}
        {...this.props}
      >
        {/*
          Finally, instead of passing down a slew of props and callbacks,
          we can compose our component as cleanly as we want
        */}
        <ConnectedFooBarBazComponent />
        <FooComponent />
        <ConnectedBazComponent
          message='Hello!'
        />
        <ConnectedControlComponent />
      </Provider>
    )
  }
}

// 2: As a higher order component or decorator
class MyAwesomeReusableComponent extends Component {
  render () {
    return (
      <div>
        <ConnectedFooBarBazComponent />
        <FooComponent />
        <ConnectedBazComponent
          message='Hi there!'
        />
        <ConnectedControlComponent />
      </div>
    )
  }
}
// When using Provider as a higher order component, you can pass an object
// as the second argument which will serve as the initial state for the Provider
const ProvidedMyAwesomeReusableComponent = Provider(MyAwesomeReusableComponent, {
  baz: 3
})

class Demo extends Component {
  constructor () {
    super()
    this.state = {
      foo: 1,
      bar: 2
    }
  }
  render () {
    const {
      foo,
      bar
    } = this.state
    return (
      // Let's use our awesome reusable component with some props!
      <div>
        <button
          onClick={() => this.setState(state => ({
            foo: 1,
            bar: 2
          }))}
        >Reset State</button>
        <br />
        <br />
        <InlineMyAwesomeReusableComponent
          foo={foo}
          bar={bar}
        />
        <br />
        <br />
        <hr />
        <br />
        <br />
        <ProvidedMyAwesomeReusableComponent
          foo={foo}
          bar={bar}
        />
      </div>
    )
  }
}

export default () => <Demo />

function makeRandomColor () {
  return `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`
}
