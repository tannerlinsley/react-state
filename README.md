# codux

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

Predictable state container for local React Components

## Features

- **2kb!** (minified)
- No dependencies (other than React)
- Avoid repetitive props and callbacks throughout deeply nested components
- Improved performance via React.PureComponent
- Redux inspired API

## [Demo](https://codux.js.org/?selectedKind=2.%20Demos&selectedStory=Kitchen%20Sink&full=0&down=0&left=1&panelRight=0&downPanel=kadirahq%2Fstorybook-addon-actions%2Factions-panel)

## Table of Contents
- [Installation](#installation)
- [Inline Example](#inline-example)
- [HOC Example](#hoc-example)

## Installation
```bash
$ yarn add codux
```

## Inline Example
```javascript
import React from 'react'
import { Provider, Connect } from 'codux'

export default const InlineDemo = (
  // A Provider is a new instance of state for all nodes inside it
  <Provider
    count: 0
  >
    // Use Connect to subscribe to values from the Provider state
    <Connect
      subscribe={state => ({
        count: state.count
      })}
    >
      {({
        count
      }) => (
        <span>{count}</span>
      )}
    </Connect>
    // Every Connected component can use the 'dispatch' prop
    // to update the Provider's store
    <Connect>
      {({
        dispatch
      }) => (
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
      )}
    </Connect>
  </Provider>
)
```

## HOC Example
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

const HocDemo = () => (
  <div>
    <ConnectedCount />
    <ConnectedIncrement />
  </div>
)

// A Provider is a new instance of state for all nodes inside it
const ProvidedHocDemo = Provider(HocDemo)

export default ProvidedHocDemo
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
