const path = require('path');
const uglify = require("uglify-js");
const Handlebars = require("handlebars");
const fs = require('fs')

function compilefile(input, output, templateVars = {}) {
  const code = fs.readFileSync(input).toString()
  const template = Handlebars.compile(code)
  const rendered = template(templateVars)
  const result = uglify.minify(rendered)
  if (result.code) {
    fs.writeFileSync(output, result.code)
  } else {
    throw new Error(`Failed to compile ${output.split('/').pop()}.\n${result.error}\n`)
  }
}

function relPath(segment) {
  return path.join(__dirname, segment)
}

compilefile(relPath('src/fuul.js'), relPath('./dest/fuul.js'))

const variants = [['local']];
variants.map(variant => {
  const options = variant.map(variant => variant.replace('-', '_')).reduce((acc, curr) => (acc[curr] = true, acc), {})
  compilefile(relPath('src/fuul.js'), relPath(`./dest/fuul.${variant.join('.')}.js`), options)
})