import {
  AssetsManager,
  FilesInput,
  MeshAssetTask,
  Scene,
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GLTF2Export } from "@babylonjs/serializers/glTF";

interface INiceLoaderOptions {
  container: string;
  checkCollisions: boolean;
}

/**
 * The NiceLoader lets to load GLB files into a scene, transform them with the help of the Inspector and then export GLB or save JSON file with transforms.
 * Designed to use when developing Babylon.js scenes. Just call the Niceloader to quickly check any models directly in your application environment.
 * @param scene Babylon Scene
 * @param arr Pass here an empty array for storing loaded models
 * @param options Additional options: container (HTML parent element), checkCollisions
 */
export class NiceLoader {
  scene: Scene;
  arr: Array<MeshAssetTask>;
  callback: () => void;
  options?: INiceLoaderOptions;

  constructor(
    scene: Scene,
    arr: Array<MeshAssetTask>,
    callback: () => void,
    options?: INiceLoaderOptions
  ) {
    this.scene = scene;
    this.arr = arr;
    this.options = options;
    this.callback = callback;

    this.createUploadButton();
    this.uploadModel(scene, arr);
  }

  createUploadButton() {
    let parentElem;
    let wrapper = document.getElementById("nl-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.setAttribute("id", "nl-wrapper");
      wrapper.style.top = "0px";
      wrapper.style.fontFamily = "sans-serif";
      wrapper.style.fontSize = "12px";
      wrapper.style.padding = "4px";
      wrapper.style.backgroundColor = "rgba(0.5, 0.5, 1, 0.5)";

      if (this.options?.container) {
        parentElem = document.getElementById(this.options.container);
      } else {
        parentElem = document.body;
        wrapper.style.position = "absolute";
      }

      if (parentElem) {
        parentElem.appendChild(wrapper);
      }
    }

    let container = document.getElementById("nl-container");
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("id", "nl-container");
      container.style.padding = "4px";
      wrapper.appendChild(container);
    }

    let sizeDiv = document.getElementById("sizeDiv");
    if (!sizeDiv) {
      sizeDiv = document.createElement("span");
      sizeDiv.setAttribute("id", "sizeDiv");
      sizeDiv.style.float = "right";
      sizeDiv.style.padding = "5px";
      sizeDiv.style.color = "cyan";
      container.appendChild(sizeDiv);
    }

    let fileInput = document.getElementById("loadFile");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.setAttribute("id", "loadFile");
      fileInput.setAttribute("type", "file");
      fileInput.style.color = "teal";
      container.appendChild(fileInput);
    }

    let deleteButton = document.getElementById("deleteButton");
    if (!deleteButton) {
      deleteButton = document.createElement("button");
      deleteButton.setAttribute("id", "deleteButton");
      deleteButton.style.float = "right";
      deleteButton.innerText = "Delete";
      deleteButton.style.display = "none";
      deleteButton.style.border = "2px solid palevioletred";
      deleteButton.style.backgroundColor = "#7B1F07";
      deleteButton.style.color = "white";
      deleteButton.style.marginLeft = "15px";
      wrapper.appendChild(deleteButton);
    }

    let exportButton = document.getElementById("exportButton");
    if (!exportButton) {
      exportButton = document.createElement("button");
      exportButton.setAttribute("id", "exportButton");
      exportButton.style.float = "left";
      exportButton.innerText = "EXPORT";
      exportButton.style.display = "none";
      wrapper.appendChild(exportButton);
    }

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "saveAll";
    checkbox.value = "value";
    checkbox.id = "saveAll";
    checkbox.style.display = "none";
    checkbox.style.float = "left";

    let label = document.createElement("label");
    label.htmlFor = "saveAll";
    label.style.color = "teal";
    label.style.display = "none";
    label.id = "saveAllLabel";
    label.style.float = "left";
    label.style.paddingLeft = "5px";
    label.style.paddingRight = "15px";
    label.style.lineHeight = "20px";
    label.appendChild(document.createTextNode("Export All"));

    let exportButton2 = document.getElementById("exportButton2");
    if (!exportButton2) {
      exportButton2 = document.createElement("button");
      exportButton2.setAttribute("id", "exportButton2");
      exportButton2.innerText = "Save Transform";
      exportButton2.style.display = "none";
      wrapper.appendChild(exportButton2);
    }
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
  }

  uploadModel(scene: Scene, arr: Array<MeshAssetTask>) {
    const assetsManager = new AssetsManager(scene);
    let root: Mesh;
    let modelsArray = arr;

    const tempNodes = scene.getNodes(); // To store existing nodes and not export them later

    assetsManager.onTaskSuccessObservable.add((task: any) => {
      root = task.loadedMeshes[0] as Mesh;
      root.name = task.name;
      //    console.log("task successful", task);

      if (this.options?.checkCollisions) {
        task.loadedMeshes.forEach((element: any) => {
          element.checkCollisions = true;
        });
      }

      modelsArray.push(task);

      if ((scene.debugLayer as any).BJSINSPECTOR) {
        scene.debugLayer.show({
          handleResize: true,
          overlay: true,
          embedMode: true,
          enablePopup: false,
        });
        scene.debugLayer.select(root);
      }
      // Show HTML elements
      document.getElementById("deleteButton")!.style.display = "initial";
      document.getElementById("exportButton")!.style.display = "initial";
      document.getElementById("exportButton2")!.style.display = "initial";

      document.getElementById("saveAll")!.style.display = "initial";
      document.getElementById("saveAllLabel")!.style.display = "initial";

      this.callback();
    });

    assetsManager.onTaskErrorObservable.add(function (task) {
      console.log(
        "task failed: " + task.name,
        task.errorObject.message,
        task.errorObject.exception
      );
    });

    // Input onchange
    const loadButton = document.getElementById("loadFile");

    loadButton!.onchange = function (evt) {
      const files: any = (evt.target as HTMLInputElement)!.files;
      const filename = files[0].name;
      const blob = new Blob([files[0]]);

      // Display file size
      const sizeInMB = (files[0].size / (1024 * 1024)).toFixed(2);
      document.getElementById("sizeDiv")!.innerHTML +=
        "<small>" + sizeInMB.toString() + " Mb</small> ";

      FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

      assetsManager.addMeshTask(filename, "", "file:", filename);
      assetsManager.load();
    };

    // DELETE ALL
    document.getElementById("deleteButton")!.onclick = function (_e) {
      modelsArray.forEach((element: MeshAssetTask) => {
        element.loadedMeshes[0].dispose(false, true);

        for (const el of element.loadedAnimationGroups) {
          el.dispose();
        }
        for (const el of element.loadedSkeletons) {
          el.dispose();
        }
        for (const el of element.loadedParticleSystems) {
          el.dispose();
        }
      });

      modelsArray = [];

      // Hide HTML elements
      document.getElementById("sizeDiv")!.innerHTML = "";

      (document.getElementById("loadFile") as HTMLInputElement).value = "";
      loadButton!.innerHTML = "";

      document.getElementById("deleteButton")!.style.display = "none";
      document.getElementById("exportButton")!.style.display = "none";
      document.getElementById("exportButton2")!.style.display = "none";

      document.getElementById("saveAll")!.style.display = "none";
      document.getElementById("saveAllLabel")!.style.display = "none";
    };

    // EXPORT

    document.getElementById("exportButton2")!.onclick = function (_e) {
      const transformsArray: any = [];
      modelsArray.forEach((element) => {
        const transforms = {
          position: element.loadedMeshes[0].position,
          rotation: element.loadedMeshes[0].rotation,
          scaling: element.loadedMeshes[0].scaling,
          name: element.name,
        };
        transformsArray.push(transforms);
      });
      // Convert JSON to the file to start download
      downloadCSV(transformsArray);
    };

    // Export GLB, either the last uploaded one or the whole scene with uploaded models
    document.getElementById("exportButton")!.onclick = function (_e) {
      console.log(
        (document.getElementById("saveAll") as HTMLInputElement).checked
      );

      let saveAll = (document.getElementById("saveAll") as HTMLInputElement)
        .checked;

      let options = {
        shouldExportNode: function (node: any) {
          if (!saveAll) {
            if (!(tempNodes as any).includes(node)) {
              return node;
            }
          } else {
            return node;
          }
        },
      };

      // Form the GLB export filename
      let exportFileName = "";

      modelsArray.forEach((m) => {
        exportFileName += m.name.slice(0, 9) + "-";
      });

      exportFileName = "NL-" + exportFileName.slice(0, -1);

      // Download GLB
      GLTF2Export.GLBAsync(scene, exportFileName, options).then((glb) => {
        glb.downloadFiles();
      });
    };
  }
}

function downloadCSV(arr: any, args?: { filename: string }) {
  let data, filename, link;

  const csv = "data:text/json;charset=utf-8," + JSON.stringify(arr);

  filename = args?.filename || "NL-export.json";

  data = encodeURI(csv);

  link = document.createElement("a");
  link.setAttribute("href", data);
  link.setAttribute("download", filename);
  link.click();
}
