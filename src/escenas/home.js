import ml5 from "ml5";

export default class home extends Phaser.Scene {
  constructor() {
    super("home");
  }

  init() {}

  create() {
    this.cameras.main.setBackgroundColor(0xffffffff).setZoom(0.5);
    let video = document.querySelector("#video");

    this.delta = 0;
    this.previuosValue = 0;

    const player = new Tone.GrainPlayer(require("../assets/violin.mp3"), () => {
      player.volume.value = -1000;
      player.start();
    }).toDestination();
    player.loop = true;

    this.character = this.add.spine(0, 0, "character");

    let poses = [];

    navigator.getMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    navigator.getMedia(
      {
        video: true,
        audio: false,
      },
      function (stream) {
        video.srcObject = stream;

        video.play();
      },
      function (err) {
        console.log("An error occured! " + err);
      }
    );

    let graphics = this.add.graphics();

    video.addEventListener(
      "canplay",
      (ev) => {
        const poseNet = ml5.poseNet(video, "single", modelLoaded, {
          architecture: "MobileNetV1",
          imageScaleFactor: 0.1,
          outputStride: 8,
          flipHorizontal: true,
          // minConfidence: 0.15,
          // maxPoseDetections: 5,
          // scoreThreshold: 0.5,
          nmsRadius: 20,
          // detectionType: "multiple",
          inputResolution: 801,
          multiplier: 1.0,
          quantBytes: 4,
        });

        function modelLoaded() {
          console.log("Model Loaded!");
        }
        // Listen to new 'pose' events
        poseNet.on("pose", (results) => {
          poses = results;
          graphics.clear();
          this.character.setPosition(
            poses[0].pose.nose.x,
            poses[0].pose.nose.y + 500
          );

          poses[0].pose.keypoints.forEach((keypoint) => {
            // console.log(keypoint);
            graphics.fillStyle(0xff0000, 1);
            graphics.fillCircle(keypoint.position.x, keypoint.position.y, 10);

            if (keypoint.score < 0.2) return;

            let ik = this.character.skeleton.findIkConstraint(keypoint.part);
            // console.log(ik);
            if (ik) {
              let position = new Phaser.Math.Vector2(
                keypoint.position.x - this.character.x,
                keypoint.position.y - this.character.y
              );
              ik.target.x = -position.x;
              ik.target.y = -position.y;
            }
          });
        });
      },
      false
    );

    this.time.addEvent({
      loop: true,
      delay: 100,
      callback: () => {
        this.delta =
          this.previuosValue -
          this.character.skeleton.findIkConstraint("leftWrist").target.x;
        this.previuosValue = this.character.skeleton.findIkConstraint(
          "leftWrist"
        ).target.x;

        let value = Phaser.Math.Wrap(this.delta, 0, 500);
        if (value == 0) {
          player.volume.value = -1000;
        } else {
          player.volume.value = 1;
          player.detune = this.delta;
        }
      },
    });
  }
  // update() {

  // }
}
