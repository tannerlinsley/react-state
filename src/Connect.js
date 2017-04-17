import React, { PureComponent, PropTypes } from 'react'

const alwaysUpdate = d => d
const neverUpdate = () => ({})

const defaultConfig = {
  statics: {}
}

export default function Connect (subscribe, config = defaultConfig) {
  // If subscribe is true, always update,
  // If Subscribe is truthy, expect a function
  // Otherwise, never update the component, only provide dispatch
  subscribe = subscribe === true ? alwaysUpdate : (subscribe || neverUpdate)
  const { statics } = config

  return (ComponentToWrap) => {
    class Connected extends PureComponent {
      // let’s define what’s needed from the `context`
      static displayName = `Connect(${ComponentToWrap.displayName || ComponentToWrap.name})`
      static contextTypes = {
        codux: PropTypes.object.isRequired
      }
      constructor () {
        super()
        // Bind non-react methods
        this.onNotify = this.onNotify.bind(this)

        // Find out if subscribe returns a function
        let subscribePreview
        try {
          subscribePreview = subscribe()
        } catch (e) {}

        if (typeof subscribePreview === 'function') {
          // If it does, make a new instance of it for this component
          this.subscribe = subscribe()
        } else {
          // Otherwise just use it as is
          this.subscribe = subscribe
        }
      }
      componentWillMount () {
        // Resolve props on mount
        this.resolveProps()
      }
      componentDidMount () {
        // Subscribe to the store for updates
        this.unsubscribe = this.context.codux.subscribe(this.onNotify.bind(this), config)
      }
      shouldComponentUpdate () {
        return false
      }
      componentWillUnmount () {
        this.unsubscribe()
      }
      onNotify () {
        if (this.resolveProps()) {
          this.forceUpdate()
        }
      }
      resolveProps () {
        const {
          children, // eslint-disable-line
          ...rest
        } = this.props
        const {
          codux
        } = this.context

        const mappedProps = this.subscribe(codux.getStore(), rest)

        const newProps = {
          ...rest,
          ...mappedProps
        }

        let needsUpdate = !this.resolvedProps

        if (this.resolvedProps) {
          for (var prop in newProps) {
            if (newProps.hasOwnProperty(prop)) {
              if (this.resolvedProps[prop] !== newProps[prop]) {
                needsUpdate = true
                break
              }
              if (needsUpdate) break
            }
            if (needsUpdate) break
          }
        }

        this.resolvedProps = newProps

        return needsUpdate
      }
      render () {
        return (
          <ComponentToWrap
            {...this.props}
            {...this.resolvedProps}
            dispatch={this.context.codux.dispatch}
          />
        )
      }
    }

    for (var prop in statics) {
      if (statics.hasOwnProperty(prop)) {
        Connected[prop] = statics[prop]
      }
    }
    return Connected
  }
}
