import { ArcRotateCamera, CreateGround, CreateSphere, Engine, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';
import './style.scss'
import { Inspector } from '@babylonjs/inspector';


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<canvas id="renderCanvas"></canvas>
`;

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

const engine = new Engine(canvas);

const scene = new Scene(engine);

Inspector.Show(scene, {});

const camera = new ArcRotateCamera("camera1", 0, 0, 0, new Vector3(0, 5, -10), scene);

camera.setTarget(Vector3.Zero());

camera.attachControl(canvas, true);

const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
light.intensity=0.7;
const sphere = CreateSphere("sphere1", {
  segments:16,
  diameter:1, 
},scene);
sphere.position.y=2;

CreateGround("ground1", {
  width:6,
  height:6,
  subdivisions:2,
}, scene);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', function(){
  engine.resize();
});
