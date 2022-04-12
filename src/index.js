import "./assets/less.less";
import $ from "jquery";
const _ = require("lodash");

const logoSrc = require("./assets/images/jietu.png");
const image = new Image();
image.src = logoSrc;
document.body.appendChild(image);
