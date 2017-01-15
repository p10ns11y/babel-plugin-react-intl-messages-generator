"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = statelessComponent;
function statelessComponent() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "span",
      null,
      "I am stateless Component"
    ),
    "I love props a lot!"
  );
}
