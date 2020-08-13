
export default class boot extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(){
    require("../assets/Character.png")
    this.load.setBaseURL("")
    this.load.spine("character",require("../assets/Character.json"),require("../assets/Character.atlas"))
  }

  create() {
    this.scene.start("home");
  }
}
