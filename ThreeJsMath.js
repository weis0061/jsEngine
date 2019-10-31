export {vec2array, array2ThreeVec}
/**
 * 
 * @param {THREE.Vector3} v Three.js Vector3
 */
var vec2array=(v)=>{
    return [v.x,v.y,v.z];
}

var array2ThreeVec=(a)=>{
    switch(a.length){
        case 2:return new THREE.Vector2(a[0],a[1]);
        case 3:return new THREE.Vector3(a[0],a[1],a[2]);
        case 4:return new THREE.Vector4(a[0],a[1],a[2],a[3]);
    }
}