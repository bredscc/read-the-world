/*
 * WEBDECONSTRUCTOR V3.0 - THREE.JS INJECTION
 * Objetivo: Lógica para rotação do globo e centramento preciso do alvo.
 * CORREÇÕES:
 * 1. Rotação mínima garantida e centramento do alvo.
 * 2. Permite recalcular o alvo em múltiplos cliques.
 * 3. Modulariza a função pokeGlobe.
*/

let globe;
let dataPoints;
let targetMarker;
let isSpinning = false;
let targetRotationY = 0;
let startTime = 0; 
const GLOBE_RADIUS = 15;

const POINT_COLOR = 0xFF00FF; 
const GLITCH_COLOR = 0x00FFFF; 
const MARKER_COLOR = 0xCCFF00; 

function latLonToVector(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

const globeControls = {
    spinToCountry: (lat, lon) => {
       isSpinning = true;
        startTime = Date.now(); 
        
        const lonRadians = lon * (Math.PI / 180);

        let requiredRotationY = lonRadians - Math.PI / 2;
        
        requiredRotationY = requiredRotationY % (Math.PI * 2);

        
        const guaranteedSpins = 2; 
        
        let finalTargetY = globe.rotation.y + (Math.PI * 2 * guaranteedSpins);
        
        finalTargetY += requiredRotationY;

        while (finalTargetY < globe.rotation.y + (Math.PI * 2)) {
             finalTargetY += (Math.PI * 2);
        }
        
        targetRotationY = finalTargetY;
        
        const position = latLonToVector(lat, lon, GLOBE_RADIUS + 0.1); 
        targetMarker.position.copy(position);
        targetMarker.lookAt(new THREE.Vector3(0, 0, 0)); 
        targetMarker.visible = true;
    },

    pokeGlobe: () => {
        if (window.globeControls && window.globeControls.spinToCountry) {
            return; 
        }
        
        const globeElement = document.querySelector(".background-globe");
        if (!globeElement) return;
        
        globeElement.style.transform = "scale(1.03) rotate(6deg)";
        globeElement.style.transition = "transform 520ms cubic-bezier(.2,.9,.25,1)";
        
        setTimeout(() => {
            globeElement.style.transition = "none";
            globeElement.style.transform = "";
        }, 520);
    }
};
window.globeControls = globeControls; 

document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') return;

    const container = document.getElementById('globe-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true }); 

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64); 
    const globeMaterial = new THREE.MeshBasicMaterial({
        color: GLITCH_COLOR, wireframe: true, transparent: true,
        opacity: 0.2, depthTest: false
    });
    globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const NUM_POINTS = 500;
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        const lat = Math.acos(Math.random() * 2 - 1);
        const lon = Math.random() * 2 * Math.PI;
        const x = GLOBE_RADIUS * Math.sin(lat) * Math.cos(lon);
        const y = GLOBE_RADIUS * Math.sin(lat) * Math.sin(lon);
        const z = GLOBE_RADIUS * Math.cos(lat);
        positions.push(x, y, z);
    }
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.3, color: POINT_COLOR, sizeAttenuation: true,
        blending: THREE.AdditiveBlending, transparent: true
    });
    dataPoints = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(dataPoints);

    const markerGeometry = new THREE.RingGeometry(0.5, 0.6, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({
        color: MARKER_COLOR, side: THREE.DoubleSide, transparent: true,
        blending: THREE.AdditiveBlending
    });
    targetMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    targetMarker.visible = false;
    scene.add(targetMarker);

    const spotlight = new THREE.SpotLight(GLITCH_COLOR, 3, 50, Math.PI / 8, 0.5, 2);
    spotlight.position.set(20, 10, 20);
    scene.add(spotlight);
    camera.position.z = 25; 

    const animate = () => {
        requestAnimationFrame(animate);
        
        if (isSpinning) {
            
            const timeElapsed = Date.now() - startTime;
            const duration = 3000; 
            const progress = Math.min(1, timeElapsed / duration);
            
            const easing = 1 - Math.pow(1 - progress, 3); 
            
            const rotationDifference = targetRotationY - globe.rotation.y;
            
            globe.rotation.y += rotationDifference * 0.05 * (1 - easing); 
            dataPoints.rotation.y = globe.rotation.y;
            
            if (Math.abs(rotationDifference) < 0.001 && timeElapsed > 2000) {
                isSpinning = false;
                setTimeout(() => targetMarker.visible = false, 5000); 
            }
            
        } else {
             globe.rotation.y += 0.001; 
             dataPoints.rotation.y += 0.001;
             targetMarker.rotation.y = globe.rotation.y;
        }

        dataPoints.material.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
        if (targetMarker.visible) {
            targetMarker.material.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
            targetMarker.scale.set(1.5 + 0.2 * Math.sin(Date.now() * 0.008), 1.5 + 0.2 * Math.sin(Date.now() * 0.008), 1.5);
        }
        
        camera.rotation.z = Math.sin(Date.now() * 0.0001) * 0.005;

        renderer.render(scene, camera);
    };

    const onWindowResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onWindowResize);

    animate();
});