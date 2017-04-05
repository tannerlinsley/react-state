import React, { PureComponent, PropTypes } from 'react'

class Connected extends PureComponent {
  // let’s define what’s needed from the `context`
  static displayName = `Connect`
  static contextTypes = {
    mydux: PropTypes.object.isRequired
  }
  constructor () {
    super()
    this.handleChange = this.handleChange.bind(this)
  }
  componentWillMount () {
    this.resolveProps()
  }
  componentDidMount () {
    this.unsubscribe = this.context.mydux.subscribe(this.handleChange.bind(this))
  }
  shouldComponentUpdate () {
    return false
  }
  componentWillUnmount () {
    this.unsubscribe()
  }
  handleChange () {
    this.resolveProps()
  }
  resolveProps () {
    const {
      mapStateToProps,
      component, // eslint-disable-line
      ...props
    } = this.props
    const {
      mydux
    } = this.context

    const resolvedMapStateToProps = mapStateToProps

    const newProps = {
      ...props,
      ...resolvedMapStateToProps(mydux.getStore(), props)
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

    if (needsUpdate) {
      this.forceUpdate()
    }
  }
  render () {
    const Comp = this.props.component
    return (
      <Comp
        {...this.resolvedProps}
        dispatch={this.context.mydux.dispatch}
      />
    )
  }
}

export default function Connect (props = () => ({})) {
  const isComponent = props && typeof props !== 'function'

  if (isComponent) {
    const {
      subscribe,
      children,
      ...rest
    } = props
    return (
      <Connected
        mapStateToProps={subscribe}
        component={children}
        {...rest}
      />
    )
  }

  return (ComponentToWrap, statics = {}) => {
    class PreConnectedComponent extends Connected {
      static displayName = `Connect(${ComponentToWrap.displayName || ComponentToWrap.name})`
      static defaultProps = {
        mapStateToProps: props,
        component: ComponentToWrap
      }
    }
    for (var prop in statics) {
      if (statics.hasOwnProperty(prop)) {
        Connected[prop] = statics[prop]
      }
    }
    return PreConnectedComponent
  }
}
