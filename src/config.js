const env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    iframe_src: 'http://charity-selection-widget.local:3000'
  },
  production: {
    iframe_src: 'http://widget.staging.sparo.com'
  }
}

export default config[env];
