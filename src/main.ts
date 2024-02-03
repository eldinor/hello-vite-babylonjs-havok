import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  Vector3,
  MeshBuilder,
  CubeTexture,
  Tools,
} from "@babylonjs/core";
import "./style.scss";
import { Inspector } from "@babylonjs/inspector";
import "@babylonjs/loaders";
import { GLTF2Export } from "@babylonjs/serializers/glTF";
import { Document, WebIO } from "@gltf-transform/core";
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
import { NiceLoader } from "./niceloader";
import { MeshoptEncoder } from "meshoptimizer";

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

  const modelArr: any = [];

  new NiceLoader(scene, modelArr, callback);

  function callback() {
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
      exportOptimized();
    };
  }

  async function exportOptimized() {
    let options = {
      shouldExportNode: function (node: any) {
        return node !== camera;
      },
    };

    const exportScene = await GLTF2Export.GLBAsync(scene, "fileName", options);
    const blob = exportScene.glTFFiles["fileName" + ".glb"] as Blob;

    const arr = new Uint8Array(await blob.arrayBuffer());
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
    glb = null;
  }

  //
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
}

await renderScene();
