import React, { PureComponent, PropTypes } from 'react'

const defaultConfig = {
  initial: {}
}

export default function (ComponentToWrap, config = defaultConfig) {
  return class Provider extends PureComponent {
    // Define our context key
    static childContextTypes = {
      reactState: PropTypes.object.isRequired
    }
    constructor (props) {
      super()
      const {
        children, // eslint-disable-line
        ...rest
      } = props
      // Initialize the store with initial state and props
      this.store = {
        ...config.initial,
        ...rest
      }
      this.subscriptions = []
      this.subscribe = this.subscribe.bind(this)
      this.dispatch = this.dispatch.bind(this)
    }
    componentWillReceiveProps (newProps) {
      // If the component receives new props, merge them into
      // the store and notify subscribers
      this.dispatch(state => ({
        ...state,
        ...newProps
      }))
      this.forceUpdate()
    }
    subscribe (connect, meta = {}) {
      const subscription = {
        connect,
        meta
      }
      // Add the subscription
      this.subscriptions.push(subscription)
      // return an unsubscribe function
      return () => {
        this.subscriptions = this.subscriptions.filter(d => d !== subscription)
      }
    }
    dispatch (fn, meta = {}) {
      // When we recieve a dispatch command, build a new version
      // of the store by calling the dispatch function

      // TODO: beforeDispatch
      const oldStore = this.store
      const newStore = fn(oldStore)
      // TODO: middleware
      this.store = newStore
      this.subscriptions.forEach(subscription => {
        let shouldNotify = true
        if (subscription.meta.filter) {
          shouldNotify = subscription.meta.filter(oldStore, newStore, meta)
        }
        shouldNotify && subscription.connect()
      })
      this.forceUpdate()
    }
    getChildContext () {
      return {
        reactState: {
          getStore: () => this.store,
          subscribe: this.subscribe,
          dispatch: this.dispatch
        }
      }
    }
    render () {
      return (
        <ComponentToWrap
          {...this.store}
        >
          {this.props.children}
        </ComponentToWrap>
      )
    }
  }
}
