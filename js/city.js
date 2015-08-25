function drawCity(city) {
    var fixedDirection = (360 - city.orientation);
    var angle = (fixedDirection / 360) * 2 * Math.PI;

    displayCityName(city.name, city.distance, angle);
    drawImage(city.distance / 50, angle);
    var appropriateFlight = findFlight(city.airport);
    if (appropriateFlight){
        displayAirlineDetails(city.distance, angle, appropriateFlight.time, appropriateFlight.origin, appropriateFlight.destination, appropriateFlight.carrier, appropriateFlight.flight);
    }
}

function drawImage(distance, angle) {

    var xx = Math.round(distance * Math.sin(angle));
    var zz = Math.round(distance * Math.cos(angle));
    // var imgSize = 


    var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
        map: THREE.ImageUtils.loadTexture('img/city.png'),
        transparent: true,
        color: 0x00FFFF
    });

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), img);
    plane.position.z = zz;
    plane.position.x = xx;
    plane.position.y = 15;
    plane.rotation.y = 0.5 * (2 * Math.PI) + angle;
    scene.add(plane);
}

function displayCityName(name, distance, angle) {
    //2PI radians per circle
    var scaledDistance = distance / 25;

    // var xx = Math.round(distance * Math.sin(angle));
    // var zz = Math.round(distance * Math.cos(angle));

    //set the text size to scale based on the distance
    var textSize = 1 + Math.round(distance / 1455);
    var textDetails = {
        size: textSize,
        height: 1
    };

    var cityText = new THREE.TextGeometry(name, textDetails);
    var cityTextMesh = new THREE.Mesh(cityText, new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 1
    }));

    //convert from polar to cartesian coordinates
    cityTextMesh.position.z = scaledDistance * Math.cos(angle);
    cityTextMesh.position.x = scaledDistance * Math.sin(angle);

    //life the text up by 20
    cityTextMesh.position.y = 20;

    //rotate the text such that they face toward the origin at a readable angle
    cityTextMesh.rotation.x = 0;
    cityTextMesh.rotation.y = 0.5 * (2 * Math.PI) + angle;
    scene.add(cityTextMesh);
}

function displayAirlineDetails(distance, angle, time, origin, destination, carrier, flightNumber){
    var scaledDistance = distance / 25;

    //set the text size to scale based on the distance
    var textSize = 1 + Math.max(0, Math.round(distance / 1455)-1);
    var textDetails = {
        size: textSize,
        height: 1
    };
    var meshDetails = {
        color: 0x9999ff,
        opacity: 1
    };

    var lineOneText = new THREE.TextGeometry(time, textDetails);
    var lineTwoText = new THREE.TextGeometry(carrier + flightNumber, textDetails);
    var lineThreeText = new THREE.TextGeometry(origin + ' -> ' + destination, textDetails);

    var lineOneTextMesh = new THREE.Mesh(lineOneText, new THREE.MeshBasicMaterial(meshDetails));
    var lineTwoTextMesh = new THREE.Mesh(lineTwoText, new THREE.MeshBasicMaterial(meshDetails));
    var lineThreeTextMesh = new THREE.Mesh(lineThreeText, new THREE.MeshBasicMaterial(meshDetails));

    var positionZ = scaledDistance * Math.cos(angle);
    var positionX = scaledDistance * Math.sin(angle);
    var rotationY = 0.5 * (2 * Math.PI) + angle;

    //convert from polar to cartesian coordinates
    lineOneTextMesh.position.z = positionZ;
    lineOneTextMesh.position.x = positionX;
    lineTwoTextMesh.position.z = positionZ;
    lineTwoTextMesh.position.x = positionX;
    lineThreeTextMesh.position.z = positionZ;
    lineThreeTextMesh.position.x = positionX;

    var scaledHeight = textSize+23;
    console.log(scaledHeight + destination);

    //life the text up by 20
    lineOneTextMesh.position.y = scaledHeight + 2*textSize*1.5;
    lineTwoTextMesh.position.y = scaledHeight + textSize*1.5;
    lineThreeTextMesh.position.y = scaledHeight;

    //rotate the text such that they face toward the origin at a readable angle
    lineOneTextMesh.rotation.x = 0;
    lineOneTextMesh.rotation.y = rotationY;
    lineTwoTextMesh.rotation.x = 0;
    lineTwoTextMesh.rotation.y = rotationY;
    lineThreeTextMesh.rotation.x = 0;
    lineThreeTextMesh.rotation.y = rotationY;

    //add the textMeshes to picture
    scene.add(lineOneTextMesh);
    scene.add(lineTwoTextMesh);
    scene.add(lineThreeTextMesh);
}

function findFlight(destination){
    var d = new Date();
    var hour = d.getHours();
    var min = d.getMinutes();

    function matchDetails(val){
        if (val.destination === destination){
            var temp = val.time.split(':');
            if ((temp[0] > hour) || (temp[0] == hour && temp[1] > min)){
                return true;
            }
        }
        return false;
    }

    //we assume the matches are sorted in order of time
    var matches = flightData.filter(matchDetails);
    return (matches.length > 0) ? matches[0] : null;
}