
// Get the canvas element from our HTML above
var canvas = document.getElementById("renderCanvas");

// Load the BABYLON 3D engine

var generateNodes = function(numNodes) {
  var n = numNodes;  // num entities

  var geo_dist = 'normal';

  var lat_center = 0;
  var long_center = 0;

  var nodes = [];

  for (var i = 0; i < n; i++) {
    node = {}
    node['s'] = jStat.uniform.sample(0,1);
    node['q'] = jStat.uniform.sample(0, (1-node['s']));

    if (geo_dist == 'normal') {
      node['latitude'] = jStat.normal.sample(lat_center, 10);
      node['longitude'] = jStat.normal.sample(long_center, 10);
    }else if (geo_dist == 'uniform') {
      node['latitude'] = jStat.uniform.sample((lat_center - 10), (lat_center + 10));
      node['longitude'] = jStat.uniform.sample((lat_center - 10), (lat_center + 10));
    }
    nodes.push(node)
  }
  return nodes;
};

var mgDistance = function(mg1, mg2) {
  var lat1 = mg1.latitude,
      lon1 =  mg1.longitude,
      lat2 = mg2.latitude,
      lon2 =  mg2.longitude;

  var dlon = lon2 - lon1;
  var dlat = lat2 - lat1;

  return Math.sqrt(dlon**2 + dlat**2);
}

var findEdges = function(nodes, threshold) {
  var combinations = Combinatorics.bigCombination(nodes,2).toArray();

  var edges = [];

  for(var i = 0; i < combinations.length; i++) {
    var pair = combinations[i];
    var dist = mgDistance(pair[0], pair[1]);
    var probMatch = (pair[0].q * pair[1].s) + (pair[0].s * pair[1].q);

    if (probMatch*threshold >= dist) {
      edges.push(pair)
    }
  }

  return edges;

}



var createScene = function(engine, mgNodes, connectivityThreshold) {

  var scene = new BABYLON.Scene(engine);

  scene.clearColor = new BABYLON.Color3(0.15,0.15,0.20);

  // Create an ArcRotateCamera aimed at 0,0,0, with no alpha, beta or radius
  var camera = new BABYLON.ArcRotateCamera(
      "ArcRotateCamera", 0, 0, 0, BABYLON.Vector3.Zero(), scene
  );
  camera.setPosition(new BABYLON.Vector3(0, 30, 1));

  //var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 30, 0), scene);

  //light.intensity = 0.7;
  var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(3, 100, 300), scene);
  light0.diffuse = new BABYLON.Color3(.5, .5, .5);
  light0.specular = new BABYLON.Color3(1, 1, 1);

  var materialSurplus = new BABYLON.StandardMaterial("sphereTexture", scene);
  materialSurplus.diffuseColor = new BABYLON.Color3(.2,.9,.2);

  var materialDeficit = new BABYLON.StandardMaterial("sphereTexture", scene);
  materialDeficit.diffuseColor = new BABYLON.Color3(.9,.2,.2);

  var materialTube = new BABYLON.StandardMaterial("tubeTexture", scene);
  materialTube.emissiveColor = new BABYLON.Color3(0,1,1);

  var windFarmMaterial = new BABYLON.StandardMaterial('mat', scene);
  windFarmMaterial.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);

  //light.intensity = 0.7;
  var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(3, 10, 2), scene);
  light0.diffuse = new BABYLON.Color3(.5, .5, .5);
  light0.specular = new BABYLON.Color3(1, 1, 1);

  var loader = new BABYLON.AssetsManager(scene);

  var objLoadTask = loader.addMeshTask("phi", "", "assets/", "PHI.obj");

  objLoadTask.onSuccess = function (task) {

    //scale factor
    var sf = 0.05;
    console.log("Found " + task.loadedMeshes.length + " meshes!");

    var mesh = task.loadedMeshes[0]

    mesh.position = new BABYLON.Vector3(0,0,0);
    mesh.scaling = new BABYLON.Vector3(sf,sf,sf);
    mesh.material = windFarmMaterial;

    mgNodes.map(function(node) {
      var turpin = task.loadedMeshes[0].clone('turpin')
      turpin.position = new BABYLON.Vector3(node.latitude,0.15,node.longitude);
    });

    mesh.dispose();
  }


  // create surplus
  mgNodes.map(function(node) {
    var torus = BABYLON.Mesh.CreateTorus("torus", node.q, 0.03, 10, scene);
    torus.position = new BABYLON.Vector3(node.latitude,0,node.longitude);
    torus.material = materialSurplus;
  });

  // create deficit
  mgNodes.map(function(node) {
    var torus = BABYLON.Mesh.CreateTorus("torus", node.s, 0.03, 10, scene);
    torus.position = new BABYLON.Vector3(node.latitude,0,node.longitude);
    torus.material = materialDeficit;
  });

  // create edges
  edges = findEdges(mgNodes, connectivityThreshold);
  edges.map(function(mgPair) {
    var line = BABYLON.MeshBuilder.CreateTube("tube", {path: [
      new BABYLON.Vector3(mgPair[0].latitude, 0, mgPair[0].longitude),
      new BABYLON.Vector3(mgPair[1].latitude, 0, mgPair[1].longitude)],
      radius: 0.005}, scene);
      line.material = materialTube;
  });


  loader.onFinish = function (tasks) {
    engine.runRenderLoop(function () {
      scene.activeCamera.alpha += .005;
      scene.render();
    });
  };

  loader.load();


  return scene;

};

$(document).ready(function() {

  $('.controls button').click(function() {
    var numNodes = parseInt($('#num-grids').val());
    var connThreshold = parseInt($('#conn-threshold').val());

    if (scene != null)  {
      scene.dispose();
      engine.dispose();
      scene = null;
      engine = null;
    }
    var engine = new BABYLON.Engine(canvas, true);

    var mgNodes = generateNodes(numNodes);
    var scene = createScene(engine, mgNodes, connThreshold);
    scene.activeCamera.attachControl(canvas);

    window.addEventListener("resize", function() {
      engine.resize();
    });

  });

});
