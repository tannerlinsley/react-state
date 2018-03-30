module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactState',
      externals: {
        react: 'React'
      }
    }
  }
}
