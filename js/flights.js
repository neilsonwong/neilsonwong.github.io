var scene,
    camera, 
    renderer,
    element,
    container,
    effect,
    controls,
    clock,
    flightData;

var cities = [
  {name: 'Toronto', distance: 1599, orientation: 68, airport: 'YYZ'},
  {name: 'London', distance: 6998, orientation: 79, airport: 'LHR'},
  // {name: 'Boston', distance: 2010, orientation: 80, airport: 'BOS'},
  {name: 'New York City', distance: 1762, orientation: 88, airport: 'JFK'},
  {name: 'Birmingham', distance: 933, orientation: 138, airport: 'BHM'},
  {name: 'Melbourne', distance: 14942, orientation: 235, airport: 'MEL'},
  {name: 'El Dorado Hills', distance: 2289, orientation: 269, airport: 'SMF'},
  {name: 'Vancouver', distance: 2524, orientation: 296, airport: 'YVR'}
];

$.getJSON('MCI.json', function(data) {
    flightData = data;
    init();
});

function init() {
  scene = new THREE.Scene();

  //add the webGL renderer into the DOM
  renderer = new THREE.WebGLRenderer({ antialias: true });
  element = renderer.domElement;
  container = document.getElementById('webglviewer');
  container.appendChild(element);

  //setup the stereoscopic view
  effect = new THREE.StereoEffect(renderer);

  setupCamera();
  setupControls();
  setupFloor();
  setupLighting();
  setupSkybox();

  var city, index;
  for (index in cities){
    city = cities[index];
    drawCity(city);
  }

  clock = new THREE.Clock();
  animate();
}

function setupCamera(){
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 2000);
  camera.position.set(0, 25, 0);
  scene.add(camera);
}

function setupControls(){
  // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(
    camera.position.x + 0.15,
    camera.position.y,
    camera.position.z
  );

  controls.noPan = true;
  controls.noZoom = true;

  // Our preferred controls via DeviceOrientation
  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }
    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();
    element.addEventListener('click', fullscreen, false);
    window.removeEventListener('deviceorientation', setOrientationControls, true);
  }

  window.addEventListener('deviceorientation', setOrientationControls, true);
}

function setupLighting(){
  var light = new THREE.AmbientLight( 0x99999 ); // soft white light
  scene.add( light );
}

function setupSkybox() {
    // define path and box sides images
    var sides = [
      'textures/night.jpg',
      'textures/night.jpg',
      'textures/night.jpg',
      'textures/night.jpg',
      'textures/night.jpg',
      'textures/night.jpg'
    ];
    // load images
    var scCube = THREE.ImageUtils.loadTextureCube(sides);
    scCube.format = THREE.RGBFormat;
    // prepare skybox material (shader)
    var skyShader = THREE.ShaderLib.cube;
    skyShader.uniforms.tCube.value = scCube;
    var skyMaterial = new THREE.ShaderMaterial( {
      fragmentShader: skyShader.fragmentShader, vertexShader: skyShader.vertexShader,
      uniforms: skyShader.uniforms, depthWrite: false, side: THREE.BackSide
    });
    // create Mesh with cube geometry and add to the scene
    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(1500, 1500, 1500), skyMaterial);
    skyMaterial.needsUpdate = true;
    scene.add(skyBox);
}

function setupFloor(){
  //textures must be 512px
  var floorTexture = THREE.ImageUtils.loadTexture('textures/greens2.jpg');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat = new THREE.Vector2(20, 20);
  floorTexture.anisotropy = renderer.getMaxAnisotropy();

  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: floorTexture
  });

  var geometry = new THREE.PlaneBufferGeometry(1500, 1500);
  var floor = new THREE.Mesh(geometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
}


function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update() {
  resize();
  camera.updateProjectionMatrix();
  controls.update();
}

function render() {
  effect.render(scene, camera);
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}
