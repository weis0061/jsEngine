import * as THREE from 'three';
export { smoothStep, lerp, normalize, add, vec2array, array2ThreeVec, len, sub, mult, min, points2vec , slerp}
var slerp = require('quat-slerp');
var smoothStep = (from, to, speed) => {
    var diff=sub(to, from);
    var dir=normalize(diff);
    speed=Math.min(len(diff),speed);
    return add(mult( dir,speed),from);
}
var lerp=(a,b,t)=>{
    if(t===0)return a;
    return add(mult( sub(b,a),1/t),a);
}
var len=(a)=>{
    var sq=0;
    for (var i = 0; i < a.length; i++) {
        sq+=a[i]*a[i];
    }
    return Math.sqrt(sq);
}
var normalize=(a)=>{
    var d=len(a);
    if(d!=0){
        var r=[];
        for (let i = 0; i < a.length; i++) {
            r[i]=a[i]/d;
        }
    }
    else{
        var r=[];
        for (let i = 0; i < a.length; i++) {
            r[i]=0;
        }
    }
    return r;
}
//a - b
var sub=(a,b)=>{
    var r=[];
    for (let i = 0; i < a.length; i++) {
        r[i]=a[i]-b[i];
    }
    return r;
}
var add=(a,b)=>{
    var r=[];
    for (let i = 0; i < a.length; i++) {
        r[i]=a[i]+b[i];
    }
    return r;
}
var mult=(a,m)=>{
    var r=[];
    for (let i = 0; i < a.length; i++) {
        r[i]=a[i]*m;
    }
    return r;
}
var min=(a,b)=>{
    var r=[];
    for (let i = 0; i < a.length; i++) {
        r[i]=Math.min(a[i],b[i]);
    }
    return r;
}

var points2vec=sub;
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