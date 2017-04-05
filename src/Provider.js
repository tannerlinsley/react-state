import React, { PureComponent, PropTypes } from 'react'

class ProviderClass extends PureComponent {
  static childContextTypes = {
    mydux: PropTypes.object.isRequired
  }
  constructor (props) {
    super()
    const {
      ComponentToWrap, // eslint-disable-line
      children, // eslint-disable-line
      ...rest
    } = props
    this.store = {...rest}
    this.subscribers = []
    this.subscribe = this.subscribe.bind(this)
    this.notify = this.notify.bind(this)
    this.dispatch = this.dispatch.bind(this)
  }
  componentWillReceiveProps (newProps) {
    for (var prop in newProps) {
      if (newProps.hasOwnProperty(prop)) {
        if (this.store[prop] !== newProps[prop]) {
          this.dispatch(state => ({
            ...state,
            ...newProps
          }))
        }
      }
    }
  }
  subscribe (cb) {
    // Add the subscription
    this.subscribers.push(cb)
    // return an unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(d => d !== cb)
    }
  }
  dispatch (fn) {
    // Build the new version of the store
    const newStore = fn(this.store)

    let needsUpdate = !this.store

    if (this.store) {
      for (var prop in newStore) {
        if (newStore.hasOwnProperty(prop)) {
          if (this.store[prop] !== newStore[prop]) {
            needsUpdate = true
            break
          }
          if (needsUpdate) break
        }
        if (needsUpdate) break
      }
    }

    this.store = newStore

    if (needsUpdate) {
      this.notify()
    }
  }
  notify () {
    this.subscribers.forEach(d => d())
  }
  getChildContext () {
    return {
      mydux: {
        getStore: () => this.store,
        subscribe: this.subscribe,
        dispatch: this.dispatch
      }
    }
  }
  render () {
    const {
      ComponentToWrap,
      children
    } = this.props
    if (ComponentToWrap) {
      return (
        <ComponentToWrap {...this.props} />
      )
    }
    return children.length > 1 ? (
      <div>{children}</div>
    ) : children
  }
}

export default function Provider (props = () => null, initialState = {}) {
  const isComponent = typeof props !== 'function'
  const ComponentToWrap = isComponent ? props.children : props

  if (isComponent) {
    return (
      <ProviderClass
        {...props}
      >
        {ComponentToWrap}
      </ProviderClass>
    )
  }
  return class PreProviderClass extends ProviderClass {
    static defaultProps = {
      ComponentToWrap,
      ...initialState
    }
  }
}
