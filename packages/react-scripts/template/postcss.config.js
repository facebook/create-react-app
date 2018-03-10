module.exports = {
  ident: 'postcss',
  plugins: [
    require('postcss-flexbugs-fixes'),
    require('postcss-easy-import'),
    require('tailwindcss')('./tailwind.js'),
    require('autoprefixer')({
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9' // React doesn't support IE8 anyway
      ],
      flexbox: 'no-2009'
    })
  ]
}
