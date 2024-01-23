import {
  AbstractMesh,
  ArcRotateCamera,
  Color3,
  CreateCapsule,
  CreateGround,
  DirectionalLight,
  Engine,
  HavokPlugin,
  HemisphericLight,
  InstancedMesh,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Tools,
  Vector3,
} from "@babylonjs/core";
import "./style.scss";
import { Inspector } from "@babylonjs/inspector";

import HavokPhysics from "@babylonjs/havok";

import dungeoneer from "dungeoneer";

import pathfinding from "pathfinding";

import * as ktx from "ktx2-encoder";
import type { encodeKTX2Cube } from "../node_modules/ktx2-encoder/types/index";

import { load, encode } from "@loaders.gl/core";
import { KTX2BasisWriter } from "@loaders.gl/textures";
import { ImageLoader } from "@loaders.gl/images";

/*
import {
  RadialCloner,
  LinearCloner,
  MatrixCloner,
  ObjectCloner,
} from "example-typescript-package";
*/

console.log(KTX2BasisWriter);
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<canvas id="renderCanvas"></canvas>
`;

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

console.log(ktx);

var imgElephant = document.createElement("img");

document.body.appendChild(imgElephant);

imgElephant.src = "https://playground.babylonjs.com/textures/floor.png";
imgElephant.crossOrigin = "anonymous";

let nk = await ktx.encodeToKTX2(imgElephant, { type: 0 });
console.log(nk);
const image = await load(
  "https://playground.babylonjs.com/textures/floor.png",
  ImageLoader,
  { image: { type: "data" } }
);

console.log(image);

const encodedData = await encode(image, KTX2BasisWriter);

console.log(encodedData);

let blob = new Blob([nk]); // or encodedData

console.log(blob);

var blobUrl = URL.createObjectURL(blob);

console.log(blobUrl);

var link = document.createElement("a"); // Or maybe get it from the current document
link.href = blobUrl;
link.download = "aDefaultFileName.ktx2";
link.innerHTML = "Click here to download the file";
document.body.appendChild(link); // Or append it whereever you want
link.style.position = "absolute";

//let nf = new File(nk, "sdfsdf");

HavokPhysics().then((havokInstance: any) => {
  const havokPlugin = new HavokPlugin(true, havokInstance);

  const engine = new Engine(canvas);

  const scene = new Scene(engine);
  scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);

  Inspector.Show(scene, {});

  const camera = new ArcRotateCamera(
    "camera1",
    0,
    0,
    50,
    new Vector3(0, 25, -50),
    scene
  );

  camera.setTarget(new Vector3(50, 2, 50));

  camera.attachControl(canvas, true);

  const hemisphericLight = new HemisphericLight(
    "light1",
    new Vector3(0, 1, 0),
    scene
  );
  hemisphericLight.intensity = 0.5;
  /*
  const directionalLight = new DirectionalLight(
    "dir01",
    new Vector3(-1, -2, -1),
    scene
  );
  directionalLight.intensity = 0.5;
  directionalLight.position = new Vector3(20, 40, 20);

  const shadowGenerator = new ShadowGenerator(1024 * 4, directionalLight);

  

  for (let iz = -5; iz <= 5; iz += 1) {
    for (let ix = -5; ix <= 5; ix += 1) {
      for (let iy = 0; iy <= 5; iy += 1) {
        const capsule = CreateCapsule(
          "capsule" + iy,
          {
            height: 2,
            radius: 0.5,
          },
          scene
        );
        capsule.position.y = 5 + iy * 2;
        // 崩れないので少しずらしておく
        capsule.position.x = ix + iy * 0.001;
        capsule.position.z = iz;
        capsule.receiveShadows = true;
        //  shadowGenerator.addShadowCaster(capsule);

        /* const capsuleAggregate = */
  /*
        new PhysicsAggregate(
          capsule,
          PhysicsShapeType.CAPSULE,
          { mass: 1, restitution: 0.75 },
          scene
        );
      }
    }
  }
*/
  const ground = CreateGround(
    "ground1",
    {
      width: 1000,
      height: 1000,
      subdivisions: 10,
    },
    scene
  );
  ground.position.y = -0.1;
  ground.receiveShadows = true;

  /* const groundAggregate = */ new PhysicsAggregate(
    ground,
    PhysicsShapeType.BOX,
    { mass: 0 },
    scene
  );
  //
  //

  //
  const BOXSIZE = 10;

  //
  const box = MeshBuilder.CreateBox("box");
  box.setEnabled(false);

  box.material = new StandardMaterial("boxMat");
  box.material.diffuseColor = Color3.Blue();

  const door = MeshBuilder.CreateBox("door", {
    width: 0.2,
    height: 1.2,
    depth: 1,
  });
  door.setEnabled(false);
  door.material = new StandardMaterial("doorMat");
  door.material.diffuseColor = Color3.Green();

  const redBox = MeshBuilder.CreateBox("redBox", {
    width: 1,
    height: 1.4,
    depth: 1,
  });
  redBox.material = new StandardMaterial("redBoxMat");
  redBox.material.diffuseColor = Color3.Red();
  redBox.setEnabled(false);

  const magBox = MeshBuilder.CreateBox("magBox", {
    width: 1,
    height: 1.4,
    depth: 1,
  });
  magBox.material = new StandardMaterial("magBoxMat");
  magBox.material.diffuseColor = Color3.Magenta();
  magBox.setEnabled(false);

  const sphere = MeshBuilder.CreateSphere("sphere", {
    diameter: 1 * BOXSIZE,
    segments: 32,
  });
  sphere.setEnabled(false);

  const secondBox = MeshBuilder.CreateBox("secondBox", {
    width: 1 * BOXSIZE,
    height: 1 * BOXSIZE,
    depth: 1 * BOXSIZE,
  });
  secondBox.material = new StandardMaterial("secondBox");
  secondBox.material.diffuseColor = Color3.Purple();
  secondBox.setEnabled(false);

  const tetra = MeshBuilder.CreatePolyhedron("tetra", { type: 8, size: 10 });
  tetra.rotation.x = Tools.ToRadians(-139);
  tetra.rotation.y = Tools.ToRadians(-10);
  tetra.rotation.z = Tools.ToRadians(9);
  tetra.setEnabled(false);
  const dungeon = dungeoneer.build({
    width: 31,
    height: 31,
    seed: "babylonpress",
  });

  console.log(dungeon);

  let wallArray: Array<any> = [];
  let doorArray: Array<any> = [];
  let floorArray: Array<any> = [];
  let roomCenterArray: Array<any> = [];
  let passMeshArray: Array<any> = [];

  let pathfindArray: Array<any> = [];

  dungeon.tiles.forEach((element: any) => {
    //console.log(element);

    element.forEach((tile: any) => {
      if (tile.type == "wall") {
        //    console.log(tile);
        wallArray.push(tile);
      }
      if (tile.type == "door") {
        //    console.log(tile);
        doorArray.push(tile);
      }
      if (tile.type == "floor") {
        //    console.log(tile);
        floorArray.push(tile);
      }
    });
  });
  console.log(wallArray);
  console.log(doorArray);
  console.log(floorArray);

  box.scaling.scaleInPlace(BOXSIZE);
  door.scaling.scaleInPlace(BOXSIZE);

  wallArray.forEach((element: any, index: any) => {
    const wallBox = box.createInstance("wallBox" + index.toString());
    wallBox.position.x = element.x * BOXSIZE;
    wallBox.position.z = element.y * BOXSIZE;
  });

  doorArray.forEach((element: any) => {
    const doorBox = door.createInstance("doorBox");
    doorBox.position.x = element.x * BOXSIZE;
    doorBox.position.z = element.y * BOXSIZE;

    if (element.neighbours.e.type == "wall") {
      console.log("WALL");
      doorBox.rotation.y = Math.PI / 2;
    }
  });

  // Rooms center
  dungeon.rooms.forEach((element: any, index: any) => {
    const redBoxInst = redBox.createInstance("redBoxI" + index.toString());
    redBoxInst.position.x = (element.x + element.width / 2 - 0.5) * BOXSIZE;
    redBoxInst.position.z = (element.y + element.height / 2 - 0.5) * BOXSIZE;

    console.log(element);
    /*
    const tetraInst = tetra.createInstance("tetraInst" + index.toString());
    tetraInst.position.y += (BOXSIZE * element.width) / 2 - element.width * 2;
    tetraInst.position.x = (element.x + element.width / 2 - 0.5) * BOXSIZE;
    tetraInst.position.z = (element.y + element.height / 2 - 0.5) * BOXSIZE;
    tetraInst.scaling.scaleInPlace(element.width);
    /*
    const sphereInst = sphere.createInstance("rsphereInst" + index.toString());
    sphereInst.position.x = (element.x + element.width / 2 - 0.5) * BOXSIZE;
    sphereInst.position.z = (element.y + element.height / 2 - 0.5) * BOXSIZE;
    sphereInst.scaling.scaleInPlace(element.width + 0.5);
*/
    roomCenterArray.push(redBoxInst);

    //
    //
  });
  console.log(roomCenterArray);

  //

  roomCenterArray.forEach((element: any, index: any) => {
    const secLevelBox = secondBox.createInstance(
      "secLevelBox" + index.toString()
    );
    secLevelBox.position = element.position;
  });

  //
  //

  //
  //

  //let boolCounter = true;
  /*
  var matrix = [
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0],
  ];
*/

  var grid = new pathfinding.Grid(
    dungeon.tiles.length,
    dungeon.tiles[0].length
  );

  dungeon.tiles.forEach((xtile: any) => {
    xtile.forEach((ytile: any) => {
      if (ytile.type !== "wall") {
        grid.setWalkableAt(ytile.x, ytile.y, true);
      } else {
        grid.setWalkableAt(ytile.x, ytile.y, false);
      }
    });
  });

  console.log(grid);

  var finder = new pathfinding.AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true,
  });
  var path = finder.findPath(1, 2, 15, 26, grid.clone());

  console.log(path);
  console.log(grid);

  const floorMesh = MeshBuilder.CreateBox("floorMesh");
  floorMesh.material = new StandardMaterial("floorMeshMat");
  floorMesh.material.diffuseColor = Color3.Teal();

  floorMesh.scaling.scaleInPlace(10);
  floorMesh.setEnabled(false);

  if (path) {
    path.forEach((element: any, index: any) => {
      const floorInst = floorMesh.createInstance(
        "floorMeshI" + index.toString()
      );
      floorInst.position.x = element[0] * BOXSIZE;
      floorInst.position.z = element[1] * BOXSIZE;

      //   console.log(element);

      //floorInst.position.x = element[0];
      //floorInst.position.z = element[1];
    });
  }
  //

  /* BUILD FLOOR
  const floorMesh = MeshBuilder.CreateGround("floorMesh");
  //  floorMesh.rotation.x = Math.PI / 2;
  floorMesh.material = new StandardMaterial("floorMeshMat");
  floorMesh.material.diffuseColor = Color3.Teal();
  floorMesh.setEnabled(false);

  floorArray.forEach((element: any, index: any) => {
    const floorInst = floorMesh.clone("floorMeshI" + index.toString());
    floorInst.position.x = element.x;
    floorInst.position.z = element.y;
    passMeshArray.push(floorInst);
  });
  doorArray.forEach((element: any, index: any) => {
    const floorInst = floorMesh.clone("floorMeshI" + index.toString());
    floorInst.position.x = element.x;
    floorInst.position.z = element.y;
    passMeshArray.push(floorInst);
  });

  console.log(passMeshArray);
*/

  /* MERGE ALL WALKABLE TILES
  const allFloorMesh = Mesh.MergeMeshes(passMeshArray, true, true);
  // allFloorMesh?.scaling.scaleInPlace(10);

  allFloorMesh?.convertToUnIndexedMesh();
  // allFloorMesh?.bakeCurrentTransformIntoVertices();

  scene.meshes.forEach((mesh) => {
    if (!mesh.name.includes("merge")) {
      mesh.dispose();
    }
  });

  console.log(allFloorMesh);

*/
  /*
  const rc = new RadialCloner([box], scene, {
    count: 24,
    radius: 8,
  });
  console.log(rc);

  const lc = new LinearCloner([box], scene, {
    count: 12,
    P: { x: 0, y: 40, z: 0 },
  });

  console.log(lc);

  const mc = new MatrixCloner([box], scene, {
    mcount: { x: 30, y: 30, z: 10 },
  });

  console.log(mc);
  mc._rootNode!.position.y = 100;

  const sph1 = MeshBuilder.CreateIcoSphere("ico", {
    radius: 220,
    subdivisions: 4,
  });
  const oc = new ObjectCloner([box], sph1, scene);

  oc._rootNode!.position.y = 120;
  /*
  setTimeout(() => {
    scene.freezeActiveMeshes();
  }, 5000);
*/
  //
  //
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});

function countProperties(obj: any) {
  return Object.keys(obj).length;
}

function putMesh(mesh: Mesh, element: any, index: number) {
  const instMesh = mesh.createInstance("redBoxI" + index.toString());
  instMesh.position.x = element.x;
  instMesh.position.z = element.y;
}
