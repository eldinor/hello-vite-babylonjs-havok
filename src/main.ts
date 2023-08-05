import { ArcRotateCamera, CreateGround, CreateSphere, DirectionalLight, Engine, HavokPlugin, HemisphericLight, PhysicsAggregate, PhysicsShapeType, Scene, ShadowGenerator, Vector3 } from '@babylonjs/core';
import './style.scss'
import { Inspector } from '@babylonjs/inspector';

import HavokPhysics from "@babylonjs/havok";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<canvas id="renderCanvas"></canvas>
`;

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;


HavokPhysics().then((havokInstance) => {

  const havokPlugin = new HavokPlugin(true, havokInstance);

  const engine = new Engine(canvas);

  const scene = new Scene(engine);
  scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);
  
  Inspector.Show(scene, {});
  
  const camera = new ArcRotateCamera("camera1", 0, 0, 0, new Vector3(0, 5, -10), scene);
  
  camera.setTarget(Vector3.Zero());
  
  camera.attachControl(canvas, true);
  
  const hemisphericLight = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  hemisphericLight.intensity=0.5;

  const directionalLight = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
  directionalLight.intensity=0.5;
  directionalLight.position = new Vector3(20, 40, 20);
  const shadowGenerator = new ShadowGenerator(1024, directionalLight);

  const sphere = CreateSphere("sphere1", {
    segments:16,
    diameter:1, 
  },scene);
  sphere.position.y=2;
  sphere.receiveShadows=true;
  shadowGenerator.addShadowCaster(sphere);

  /* const sphereAggregate = */new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, scene);

  
  const ground = CreateGround("ground1", {
    width:6,
    height:6,
    subdivisions:2,
  }, scene);
  ground.receiveShadows=true;

  /* const groundAggregate = */new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
  
  engine.runRenderLoop(() => {
    scene.render();
  });
  
  window.addEventListener('resize', function(){
    engine.resize();
  });
  
});
