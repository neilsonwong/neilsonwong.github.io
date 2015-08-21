var scene,
    camera, 
    renderer,
    element,
    container,
    effect,
    controls,
    clock,

    // Particles
    particles = new THREE.Object3D(),
    totalParticles = 200,
    maxParticleSize = 200,
    particleRotationSpeed = 0,
    particleRotationDeg = 0,
    lastColorRange = [0, 0.3],
    currentColorRange = [0, 0.3],

    // City and weather API set up
    cities = [
      {name: 'Toronto', distance: 1599, orientation: 68},
      {name: 'London', distance: 6998, orientation: 79},
      {name: 'Boston', distance: 2010, orientation: 80},
      {name: 'New York City', distance: 1762, orientation: 88},
      {name: 'Birmingham', distance: 933, orientation: 138},
      {name: 'Melbourne', distance: 14942, orientation: 235},
      {name: 'El Dorado Hills', distance: 2289, orientation: 269},
      {name: 'Vancouver', distance: 2524, orientation: 296}
    ],
    cityWeather = {},
    cityTimes = [],
    currentCity = 0;
    // currentCityText = new THREE.TextGeometry(),
    // currentCityTextMesh = new THREE.Mesh();

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 2000);
  camera.position.set(0, 25, 0);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  element = renderer.domElement;
  container = document.getElementById('webglviewer');
  container.appendChild(element);
  effect = new THREE.StereoEffect(renderer);

  setupControls();
  setupFloor();
  setupLighting();
  // displayCityName('N', 30, 0);

  console.log(cities);

  var city, index;
  for (index in cities){
    city = cities[index];
    console.log(city.name)
    displayCityName(city.name, city.distance, city.orientation);
    drawImage(city.distance/50, city.orientation);
  }
  
  setupSkybox();
  // drawImage();

  clock = new THREE.Clock();
  animate();
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
    var skyShader = THREE.ShaderLib["cube"];
    skyShader.uniforms["tCube"].value = scCube;
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

function drawImage(distance, direction){
  var fixedDirection = (360 - direction);
  var angle = (fixedDirection / 360) * 2 * Math.PI;
  var xx = Math.round(distance * Math.sin(angle));
  var zz = Math.round(distance * Math.cos(angle));
  // var imgSize = 


  var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
        map:THREE.ImageUtils.loadTexture('img/city.png'),
        transparent: true, 
        color: 0x00FFFF
        // wireframe: truedd
  });
  
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), img);
  plane.position.z = zz;
  plane.position.x = xx;
  plane.position.y = 15;
  plane.rotation.y = 0.5 * (2 * Math.PI) + angle;
  scene.add(plane);
}

function displayCityName(name, distance, direction) {
  var scaledDistance = distance / 25;
  var fixedDirection = (360 - direction);
  var angle = (fixedDirection / 360) * 2 * Math.PI;
  // var xx = Math.round(distance * Math.sin(angle));
  // var zz = Math.round(distance * Math.cos(angle));
  // var textSize = Math.max(10, Math.round(distance/1000));
   var textSize = 1 + Math.round(distance/1455);
   console.log(name +': '+ textSize);

  var cityText = new THREE.TextGeometry(name, {
    size: textSize,
    height: 1
  });
  var cityTextMesh = new THREE.Mesh(cityText, new THREE.MeshBasicMaterial({
    color: 0xffffff, opacity: 1
  }));

  cityTextMesh.position.z = scaledDistance * Math.cos(angle);
  cityTextMesh.position.x = scaledDistance * Math.sin(angle);
  cityTextMesh.position.y = 20;

  cityTextMesh.rotation.x = 0;
  //2PI radians per circle
  // cityTextMesh.rotation.y = ;
  cityTextMesh.rotation.y = 0.5 * (2 * Math.PI) + angle;
  // cityTextMesh.rotation.y = -Math.PI/2;//  (direction / 360) * Math.PI;
  scene.add(cityTextMesh);
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
