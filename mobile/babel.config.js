module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
  overrides: [
    {
      test: ['./node_modules/**'],
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-flow',
      ],
    },
  ],
}
