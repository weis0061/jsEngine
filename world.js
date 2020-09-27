export {tris,triCount}
var matrix=require("ml-matrix").Matrix;
var tris=[];
var triCount=0;
export var cubes=[];
export var addTriangle=(tri)=>{
    tris.push(tri);
    triCount++;
}
var math=require('./math');
export var addCube=(position, scale)=>{
    var TrisIndex=triCount;
    
    addTriangle([[
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]
    ]
    ]);
    
    addTriangle([[
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]-scale[0] /2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    
    addTriangle([[
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]+scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]+scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0]]
    ]);
    addTriangle([[
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]+scale[2]/2.0],
        [position[0]+scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0],
        [position[0]-scale[0]/2.0,position[1]-scale[1]/2.0,position[2]-scale[2]/2.0]
    ]
    ]);
}
//not finished
var addQuad=(position,direction,width,height)=>{
    
    var p1,p2,p3,p4;
    p2=math.add(position, [direction[1] * height/2,]) ;
    addTriangle([[topLeft[0],topleft[1],topleft[2]], [bottomRight[0], topleft[1], topleft[2]], [topleft[0],bottomRight[1],topleft[2]]]);
    addTriangle([[topLeft[0],topleft[1],topleft[2]], [bottomRight[0], topleft[1], topleft[2]], [topleft[0],bottomRight[1],topleft[2]]]);
}

addCube([0,0,0],[1,1,1]);
addCube([0,0.5,0.5],[1,1,1]);