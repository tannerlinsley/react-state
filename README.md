# [codux](https://github.com/tannerlinsley/codux)

<a href="https://travis-ci.org/tannerlinsley/codux" target="\_parent">
  <img alt="" src="https://travis-ci.org/tannerlinsley/codux.svg?branch=master" />
</a>
<a href="https://npmjs.com/package/codux" target="\_parent">
  <img alt="" src="https://img.shields.io/npm/dm/codux.svg" />
</a>
<a href="https://react-chat-signup.herokuapp.com/" target="\_parent">
  <img alt="" src="https://img.shields.io/badge/slack-react--chat-blue.svg" />
</a>
<a href="https://github.com/tannerlinsley/codux" target="\_parent">
  <img alt="" src="https://img.shields.io/github/stars/tannerlinsley/codux.svg?style=social&label=Star" />
</a>
<a href="https://twitter.com/tannerlinsley" target="\_parent">
  <img alt="" src="https://img.shields.io/twitter/follow/tannerlinsley.svg?style=social&label=Follow" />
</a>

Predictable state container for self-contained React components

## Features

- **2kb!** (minified)
- No dependencies (other than React)
- Avoid repetitive props and callbacks throughout deeply nested components
- Improved performance via React.PureComponent
- Redux inspired API

## [Demo](https://codux.js.org/?selectedKind=2.%20Demos&selectedStory=Kitchen%20Sink&full=0&down=0&left=1&panelRight=0&downPanel=kadirahq%2Fstorybook-addon-actions%2Factions-panel)

## Table of Contents
- [Installation](#installation)
- [Example](#example)
- [Provider](#provider)
  - [Creating a Provider](#creating-a-provider)
  - [Initial State](#initial-state)
  - [Passing Props as State](#passing-props-as-state)
  - [Programatic Control](#programatic-control)
- [Connect](#connect)
  - [Memoization And Selectors](#memoization-and-selectors)
  - [Using the Dispatch Prop](#using-the-dispatch-prop)
  - [Dispatch Meta](#dispatch-meta)
  - [Connect Config](#connect-config)

## Installation
```bash
$ yarn add codux
```

## Example
```javascript
import React from 'react'
import { Provider, Connect } from 'codux'


const Count = ({ count }) => ({
  <span>{count}</span>
}
// Use Connect to subscribe to values from the Provider state
const ConnectedCount = Connect(state => ({
  count: state.count
}))(Count)

// Every Connected component can use the 'dispatch' prop
// to update the Provider's store
const Increment = ({ dispatch }) => ({
  <button
    // 'dispatch' takes a function that receives the
    // current provider state and returns a new one.
    onClick={() => dispatch(state => ({
      ...state,
      count: state.count + 1 // Immutable is best for performance :)
    }))}
  >
    Increment Count
  </button>
}
const ConnectedIncrement = Connect()(Increment)

const Demo = () => (
  <div>
    <ConnectedCount />
    <ConnectedIncrement />
  </div>
)

// A Provider is a new instance of state for all nodes inside it
export default Provider(Demo)
```

## Provider
The `Provider` higher-order component creates a new state that wraps the component you pass it. You can nest Providers inside each other, and when doing so, `Connect`ed components inside them will connect to the nearest parent Provider. You can also give Providers an initial state in an optional config object.
##### Creating a Provider
```javascript
const ProviderWrappedComponent = Provider(MyComponent)
```
##### Initial State
```javascript
const ProviderWrappedComponent = Provider(MyComponent, {
  // the initial state of the provider
  initial: {
    foo: 1,
    bar: 'hello'
  }
})
```
##### Passing props as state
Any props you pass to a Provider will be merged with the state and overwrite any same-key values.
```javascript
<ProviderWrappedComponent
  foo={1}
  bar='hello'
/>
```
##### Programatic Control
If you ever need to programmatically dispatch to a provider, you can use a ref!
```javascript
<ProviderWrappedComponent
  ref={provider => {
    provider.dispatch
  }}
/>
```

## Connect
The `Connect` higher-order component subscribes a component to any part of the nearest parent Provider, and also provides the component the `dispatch` prop for updating the state.
##### Subscribing to state
To subscribe to a part of the provider state, we use a function that takes the state (and component props) and returns a new object with parts of the state you're interested in. Any time the values of that object change, your component will be updated! (There is no need to return props that already exist on your component. The 'props' argument is simply there as an aid in calculating the state you need to subscribe to)
```javascript
class MyComponent extends Component {
  render () {
    return (
      <div>
        // This 'foo' prop comes from our Connect function below
        <div>{ this.props.foo }</div>
      </div>
    )
  }
}
const MyConnectedComponent = Connect(state => {
  return {
    foo: state.foo // Any time 'foo' changes, our component will update!
  }
})
```
##### Using the 'dispatch' prop
Every connected component receives the 'dispatch' prop. You can use this 'dispatch' function to update the provider state. Just dispatch a function that takes the current state and returns a new version of the state.  It's very important to make changes using immutability and also include any unchanged parts of the state.  What you return will replace the entire state!
```javascript
class MyComponent extends Component {
  render () {
    return (
      <div>
        <button
          onClick={this.props.dispatch(state => {
            return {
              ...state, // include unchanged parts of the state
              foo: Math.ceil(Math.random() * 10) // update our new random 'foo' value
            }
          })}
        >
          Randomize Foo
        </button>
      </div>
    )
  }
}
const MyConnectedComponent = Connect()(MyComponent)
```
##### Memoization and Selectors
If you need to subscribe to computed or derived data, you can use a memoized selector.  This functions exactly as it does in Redux. For more information, and examples on usage, please refer to [Redux - Computing Derived Data](http://redux.js.org/docs/recipes/ComputingDerivedData.html)
```javascript
class MyComponent extends Component {
  render () {
    return (
      <div>
        <div>{ this.props.computedValue }</div>
      </div>
    )
  }
}
const MyConnectedComponent = Connect((state, props) => {
  return {
    computedValue: selectMyComputedValue(state, props)
  }
})
```
##### Dispatch Meta
Any time you dispatch, you have the option to send through a meta object. This is useful for middlewares, hooks, and other optimization options throughout Codux.
```javascript
class MyComponent extends Component {
  render () {
    return (
      <div>
        <button
          onClick={this.props.dispatch(state => ({
            ...state,
            foo: Math.Ceil(Math.random() * 10)
          }, {
            // you can use any object as meta
            mySpecialValue: 'superSpecial'
          })}
        >
          Randomize Foo
        </button>
      </div>
    )
  }
}
const MyConnectedComponent = Connect()(MyComponent)
```
##### Connect Config
`Connect` can be customized for performance and various other enhancments:
- `filter(oldState, newState, meta)`: Only run connect if this function returns true. Useful for avoiding high-velocity dispatches or general performance tuning.
- `statics{}`: An object of static properties to add to the connected component's class.
```javascript
class MyComponent extends Component { ... }
const MyConnectedComponent = Connect(
  state => {...},
  {
    // Using the following 'filter' function, this Connect will not run if 'meta.mySpecialValue === 'superSpecial'
    filter: (oldState, newState, meta) => {
      return meta.mySpecialValue ? meta.mySpecialValue !== 'superSpecial' : true
    },

    // The Connected component class will also gain these statics
    statics: {
      defaultProps: {
        someProp: 'hello!'
      }
    }
  }
)(MyComponent)
```

## Contributing
To suggest a feature, create an issue if it does not already exist.
If you would like to help develop a suggested feature follow these steps:

- Fork this repo
- `$ yarn`
- `$ yarn run storybook`
- Implement your changes to files in the `src/` directory
- View changes as you code via our <a href="https://github.com/storybooks/react-storybook" target="\_parent">React Storybook</a> `localhost:8000`
- Make changes to stories in `/stories`, or create a new one if needed
- Submit PR for review

#### Scripts

- `$ yarn run storybook` Runs the storybook server
- `$ yarn run test` Runs the test suite
- `$ yarn run prepublish` Builds for NPM distribution
- `$ yarn run docs` Builds the website/docs from the storybook for github pages

<!-- ## Used By

<a href='https://nozzle.io' target="\_parent">
  <img src='https://nozzle.io/img/logo-blue.png' alt='Nozzle Logo' style='width:300px;'/>
</a> -->
