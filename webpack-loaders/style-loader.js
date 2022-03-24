const colors = require("colors/safe");
function loader(css) {
  console.log(colors.yellow("style-loader", css));
  let script = `
  let style = document.createElement('style');
  style.innerHTML = ${JSON.stringify(css)};
  document.head.appendChild(style)
  `;
  return script;
}

module.exports = loader;
