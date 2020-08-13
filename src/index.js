import QueryLoader2 from "queryloader2";

var loader = QueryLoader2(document.querySelector("body"), {
  barColor: "#ffffff",
  backgroundColor: "#951b81",
  percentage: true,
  barHeight: 0,
  minimumTime: 200,
  maximumTime: 10000000,
  fadeOutTime: 1000,
});

import Phaser from "phaser";

import boot from "./escenas/boot.js";
import home from "./escenas/home.js";
import ui from "./escenas/ui.js";
import spinePlugin from "./SpineWebGLPlugin.js";

const config = {
  type: Phaser.WEBGL,
  width: 1024,
  height: 715,
  clearBeforeRender: false,
  antialias: true,
  parent: "container",
  dom: {
    createContainer: true,
  },
  scene: [
    boot,
    home,
    ui,
    ],
  plugins: {
    scene: [
      {
        key: "spinePlugin",
        plugin: spinePlugin,
        mapping: "spine",
      },
    ],
  },
  scale: {
    mode: Phaser.Scale.FIT,
    fullscreenTarget: "body",
  },
};

const game = new Phaser.Game(config);
