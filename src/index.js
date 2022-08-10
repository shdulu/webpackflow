import "./assets/less.less";
import $ from "jquery";
const _ = require("lodash");
import moment from "moment";
console.log("VERSION:", VERSION);

const logoSrc = require("./assets/images/jietu.png");
const image = new Image();
image.src = logoSrc;
document.body.appendChild(image);
