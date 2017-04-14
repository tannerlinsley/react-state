import React, { PureComponent, PropTypes } from 'react'

class Connected extends PureComponent {
  // let’s define what’s needed from the `context`
  static displayName = `Connect`
  static contextTypes = {
    codux: PropTypes.object.isRequired
  }
  constructor (props) {
    super()
    this.handleChange = this.handleChange.bind(this)
    // Find out if mapStateToProps returns a function
    let mapStateToPropsPreview
    try {
      mapStateToPropsPreview = props.mapStateToProps()
    } catch (e) {}

    if (typeof mapStateToPropsPreview === 'function') {
      // If it does, make a new instance of it for this component
      this.resolvedMapStateToProps = props.mapStateToProps()
    } else {
      // Otherwise just use it as is
      this.resolvedMapStateToProps = props.mapStateToProps
    }
  }
  componentWillMount () {
    this.resolveProps()
  }
  componentDidMount () {
    this.unsubscribe = this.context.codux.subscribe(this.handleChange.bind(this))
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
      mapStateToProps, // eslint-disable-line
      component, // eslint-disable-line
      ...props
    } = this.props
    const {
      codux
    } = this.context

    const mappedProps = this.resolvedMapStateToProps(codux.getStore(), props)

    const newProps = {
      ...props,
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

    if (needsUpdate) {
      this.forceUpdate()
    }
  }
  render () {
    const Comp = this.props.component
    return (
      <Comp
        {...this.resolvedProps}
        dispatch={this.context.codux.dispatch}
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
        PreConnectedComponent[prop] = statics[prop]
      }
    }
    return PreConnectedComponent
  }
}
