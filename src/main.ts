import "./style.scss";
import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  Vector3,
  CubeTexture,
  Tools,
  MeshBuilder,
  Axis,
  Space,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import "@babylonjs/loaders";
import { GLTF2Export } from "@babylonjs/serializers/glTF";
import { WebIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  meshopt,
  prune,
  quantize,
  reorder,
  resample,
  textureCompress,
} from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { NiceLoader } from "./niceloader";

import { AnimatedGifTexture } from "./AnimatedGIF/animatedGifTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

await renderScene();

//

async function renderScene() {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

  const engine = new Engine(canvas);

  const scene = new Scene(engine);
  const hdrTexture = CubeTexture.CreateFromPrefilteredData(
    "https://playground.babylonjs.com/textures/environment.env",
    scene
  );
  hdrTexture.name = "envTex";
  hdrTexture.gammaSpace = false;
  scene.environmentTexture = hdrTexture;

  Inspector.Show(scene, { embedMode: true });

  const camera = new ArcRotateCamera(
    "camera",
    Tools.ToRadians(90),
    Tools.ToRadians(65),
    10,
    Vector3.Zero(),
    scene
  );

  camera.setTarget(Vector3.Zero());

  camera.attachControl(canvas, true);

  const hemisphericLight = new HemisphericLight(
    "light1",
    new Vector3(0, 1, 0),
    scene
  );
  hemisphericLight.intensity = 0.5;

  //

  // Creating the plane to show video
  const TV = MeshBuilder.CreatePlane("TV", { width: 10, height: 10 }, scene);
  // TV.position = new Vector3(0, 10, 20);
  TV.scaling.scaleInPlace(1);
  // Rotate to turn vertical
  TV.rotate(Axis.Z, Math.PI, Space.WORLD);
  // Rotate along Y Axis, if needed, with rotY
  TV.rotate(Axis.Y, Tools.ToRadians(0), Space.WORLD);
  TV.rotate(Axis.X, Tools.ToRadians(180), Space.WORLD);

  // Prepare dummy material to show when switching video sources
  const dummyMat = new StandardMaterial("dummyMat", scene);
  dummyMat.backFaceCulling = false;
  dummyMat.disableLighting = true;

  TV.material = dummyMat;

  // Creates a Gif Texture (looks simple ;-))
  const gifTexture = new AnimatedGifTexture("/pencil.gif", engine, () => {
    console.log("GIF Loaded");
    console.log(gifTexture);
    console.log("width: " + gifTexture._frames![0].dims.width);
    console.log("height: " + gifTexture._frames![0].dims.height);
  });
  //  gifTexture.invertZ = true;
  dummyMat.diffuseTexture = gifTexture;
  dummyMat.emissiveTexture = gifTexture;

  //

  const modelArr: any = [];

  new NiceLoader(scene, modelArr, callback, { toConsole: true });

  //
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
}

async function exportOptimized(scene: Scene) {
  let options = {
    shouldExportNode: function (node: any) {
      return node !== scene.activeCamera;
    },
  };

  const exportScene = await GLTF2Export.GLBAsync(scene, "fileName", options);
  let blob = exportScene.glTFFiles["fileName" + ".glb"] as Blob;

  let arr = new Uint8Array(await blob.arrayBuffer());
  const io = new WebIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.readBinary(arr);
  //
  await MeshoptEncoder.ready;
  //
  await doc.transform(
    dedup(),
    prune(),
    resample(),
    textureCompress({
      targetFormat: "webp",
      resize: [1024, 2024],
    }),
    quantize()
  );

  //
  let glb = await io.writeBinary(doc);
  // Then one may convert it to the URL
  let assetBlob = new Blob([glb]);
  const assetUrl = URL.createObjectURL(assetBlob);
  const link = document.createElement("a");
  link.href = assetUrl;
  link.download = "SomeName" + ".glb";
  link.click();
}

//
function callback(scene: Scene) {
  let button = document.getElementById("optimized");
  if (!button) {
    button = document.createElement("button");
    button.setAttribute("id", "optimized");
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.right = "410px";
    button.innerText = "Save Optimized";
    document.body.appendChild(button);
  }

  button.onclick = function (_evt) {
    exportOptimized(scene);
  };
}
