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

    this.parts = [];

    const violinTones = [
      require("../assets/violin.mp3"),
      require("../assets/violin_.mp3"),
      require("../assets/violin___.mp3"),
    ];
    var player;

    player = new Tone.GrainPlayer(violinTones[0], () => {
      player.volume.value = -1000;
      player.start();
    }).toDestination();
    player.loop = true;

    this.add
      .text(-100, -100, "Tone A")
      .setColor(0xffffffff)
      .setFontSize(100)
      .setOrigin(0.5)
      .setAlign("center")
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (player) player.stop();
        player = new Tone.GrainPlayer(violinTones[0], () => {
          player.volume.value = -1000;
          player.start();
        }).toDestination();
        player.loop = true;
      });
    this.add
      .text(-100, 0, "Tone B")
      .setColor(0xffffffff)
      .setFontSize(100)
      .setOrigin(0.5)
      .setAlign("center")
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (player) player.stop();

        player = new Tone.GrainPlayer(violinTones[1], () => {
          player.volume.value = -1000;
          player.start();
        }).toDestination();
        player.loop = true;
      });
    this.add
      .text(-100, 100, "Tone C")
      .setColor(0xffffffff)
      .setFontSize(100)
      .setOrigin(0.5)
      .setAlign("center")
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (player) player.stop();

        player = new Tone.GrainPlayer(violinTones[2], () => {
          player.volume.value = -1000;
          player.start();
        }).toDestination();
        player.loop = true;
      });

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
            graphics.fillStyle(0xff0000, 1);

            if (keypoint.score < 0.2) return;

            let part1 = keypoint;
            let part0 =
              this.parts.find((x) => x.part == keypoint.part) || part1;
            let weight0 = part0.score / (part1.score + part0.score);
            let weight1 = part1.score / (part1.score + part0.score);
            graphics.fillCircle(
              part1.position.x * weight1 + part0.position.x * weight0,
              part1.position.y * weight1 + part0.position.y * weight0,
              10
            );

            let ik = this.character.skeleton.findIkConstraint(keypoint.part);
            if (ik) {
              let position = new Phaser.Math.Vector2(
                (part1.position.x - this.character.x) * weight1 +
                  (part0.position.x - this.character.x) * weight0,
                (part1.position.y - this.character.y) * weight1 +
                  (part0.position.y - this.character.y) * weight0
              );

              ik.target.x = -position.x;
              ik.target.y = -position.y;
            }
          });

          this.parts = poses[0].pose.keypoints;
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
