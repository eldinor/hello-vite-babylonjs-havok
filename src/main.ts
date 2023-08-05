import { ArcRotateCamera, CreateCapsule, CreateGround,  DirectionalLight, Engine, HavokPlugin, HemisphericLight, PhysicsAggregate, PhysicsShapeType, Scene, ShadowGenerator, Vector3 } from '@babylonjs/core';
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
  
  const camera = new ArcRotateCamera("camera1", 0, 0, 0, new Vector3(0, 25, -50), scene);
  
  camera.setTarget(new Vector3(0,2,0));
  
  camera.attachControl(canvas, true);
  
  const hemisphericLight = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
  hemisphericLight.intensity=0.5;

  const directionalLight = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
  directionalLight.intensity=0.5;
  directionalLight.position = new Vector3(20, 40, 20);
  const shadowGenerator = new ShadowGenerator(1024*4, directionalLight);

  for(let iz=-5;iz<=5;iz+=1){
    for(let ix=-5;ix<=5;ix+=1){
      for(let iy=0;iy<=10;iy+=1){
        const capsule = CreateCapsule("capsule"+iy,{
          height:2,
          radius:0.5,
        },scene);
        capsule.position.y=5+iy*2;
        // 崩れないので少しずらしておく
        capsule.position.x=ix+iy*0.001;
        capsule.position.z=iz;
        capsule.receiveShadows=true;
        shadowGenerator.addShadowCaster(capsule);
      
        /* const capsuleAggregate = */new PhysicsAggregate(capsule, PhysicsShapeType.CAPSULE, { mass: 1, restitution: 0.75 }, scene);
      
      }
    }
  }

  
  const ground = CreateGround("ground1", {
    width:1000,
    height:1000,
    subdivisions:10,
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
