
// Get the canvas element from our HTML above
var canvas = document.getElementById("renderCanvas");

// Load the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);


var createScene = function () {

  var scene = new BABYLON.Scene(engine);

  scene.clearColor = new BABYLON.Color3(.7,.8,1);

  // Create an ArcRotateCamera aimed at 0,0,0, with no alpha, beta or radius
  var camera = new BABYLON.ArcRotateCamera(
      "ArcRotateCamera", 0, 0, 0, BABYLON.Vector3.Zero(), scene
  );
  camera.setPosition(new BABYLON.Vector3(0, 5, 20));

  //var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 30, 0), scene);

  //light.intensity = 0.7;
  var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(3, 10, 2), scene);
  light0.diffuse = new BABYLON.Color3(.5, .5, .5);
  light0.specular = new BABYLON.Color3(1, 1, 1);

  var loader = new BABYLON.AssetsManager(scene);

  var terrain = loader.addMeshTask("terrain", "", "assets/", "wind-terrain.obj");

  terrain.onSuccess = function (task) {

    //scale factor
    var sf = 0.2;
    console.log("Found " + task.loadedMeshes.length + " meshes!");
    var mesh = task.loadedMeshes[0];

    mesh.position = new BABYLON.Vector3(0,2,0);
    mesh.scaling = new BABYLON.Vector3(sf,sf,sf);
    //mesh.material = new BABYLON.StandardMaterial('mat', scene);
    //mesh.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  }

  loader.onFinish = function (tasks) {
    engine.runRenderLoop(function () {
      scene.activeCamera.alpha += .004;
      scene.render();
    });
  };

  loader.load();


  ////var box = BABYLON.Mesh.CreateBox("box", 1, scene);
  //var materialGround1 = new BABYLON.StandardMaterial("texture1", scene);
  ////materialGround1.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.1);
  //materialGround1.diffuseTexture = new BABYLON.Texture("assets/grass.png", scene);
  //materialGround1.specularTexture = new BABYLON.Texture("assets/grass.png", scene);
  //materialGround1.diffuseTexture.uScale = 3.0;
  //materialGround1.diffuseTexture.vScale = 3.0;
  //materialGround1.specularTexture.uScale = 3.0;
  //materialGround1.specularTexture.vScale = 3.0;

  return scene;

};


var scene = createScene();

scene.activeCamera.attachControl(canvas);

//engine.runRenderLoop(function () {
//  scene.activeCamera.alpha += .01;
//  scene.render();
//});

window.addEventListener("resize", function() {
  engine.resize();
});
