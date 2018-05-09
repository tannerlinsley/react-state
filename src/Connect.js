import React, { Component } from 'react'
import PropTypes from 'prop-types'
import hoistNonReactStatics from 'hoist-non-react-statics'

//

const alwaysUpdate = d => d
const neverUpdate = () => ({})

export default function Connect (subscribe, config = { pure: true }) {
  // If subscribe is true, always update,
  // If Subscribe is truthy, expect a function
  // Otherwise, never update the component, only provide dispatch
  subscribe = subscribe === true ? alwaysUpdate : subscribe || neverUpdate

  const { pure } = config

  return ComponentToWrap => {
    class Connected extends Component {
      // let’s define what’s needed from the `context`
      static displayName = `Connect(${ComponentToWrap.displayName || ComponentToWrap.name})`
      static contextTypes = {
        reactState: PropTypes.object.isRequired,
      }
      constructor () {
        super()
        // Bind non-react methods
        this.onNotify = this.onNotify.bind(this)

        // Find out if subscribe returns a function
        let subscribePreview
        try {
          subscribePreview = subscribe()
        } catch (e) {
          // do nothing
        }

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
        this.resolveProps(this.props)
      }
      componentDidMount () {
        // Subscribe to the store for updates
        this.unsubscribe = this.context.reactState.subscribe(this.onNotify.bind(this), config)
      }
      componentWillReceiveProps (nextProps) {
        if (!pure && this.resolveProps(nextProps)) {
          this.forceUpdate()
        }
      }
      shouldComponentUpdate () {
        return !pure
      }
      componentWillUnmount () {
        this.unsubscribe()
      }
      onNotify () {
        if (this.resolveProps(this.props)) {
          this.forceUpdate()
        }
      }
      resolveProps (props) {
        const { children, ...rest } = props
        const { reactState } = this.context

        const mappedProps = this.subscribe(reactState.getStore(), rest)

        const newProps = {
          ...mappedProps,
          ...rest,
        }

        let needsUpdate = !this.resolvedProps

        if (this.resolvedProps) {
          Object.keys(newProps).forEach(prop => {
            if (!needsUpdate && this.resolvedProps[prop] !== newProps[prop]) {
              needsUpdate = true
            }
          })
        }

        this.resolvedProps = newProps
        return needsUpdate
      }
      render () {
        const props = {
          ...this.resolvedProps,
          ...this.props,
        }
        return <ComponentToWrap {...props} dispatch={this.context.reactState.dispatch} />
      }
    }

    hoistNonReactStatics(Connected, ComponentToWrap)

    return Connected
  }
}
