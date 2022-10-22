NOTE: 
this package is farrrrr from being complete, but i think if it can help me, it might can help someone, too


What this package does:

given a latex math string, it returns its positions and indices (triangles)

ex:
import {mathmesh} from "mathmesh";
var mesh = mathmesh("\\frac{99}{3}");

console.log(mesh)

you will get:

{
   positions: [ x1, y1, z1, x2, y2, z2, .....],
  indicies: [ # # # # # .....]
}


to use in babylon:

import {mathmesh} from "mathmesh";
var verts = mathmesh("\\frace{99}{3}");
let customMesh = new Mesh("mymathmesh", scene);
let vertexData = new VertexData();

vertexData.positions = verts.positions;
vertexData.indices = verts.indices;
vertexData.applyToMesh(customMesh);

let fontmaterial = new StandardMaterial("mathmeshMat", scene);
fontmaterial.backFaceCulling = false;
fontmaterial.emissiveColor = new Color3(0, 1, 0);
customMesh.material = fontmaterial;


Usage:

1.
in some dir:

$ npm init

in index.js:

const mathmesh = require("mathmesh");
console.log(mathmesh.mathmesh("\\frac{99}{3}"));


$ node index.js

2.
in some dir:

$ npm init

put  "type": "module",   in package.json

in index.js:

import {mathmesh} from "mathmesh";
console.log(mathmesh("\\frac{99}{3}"));

$ node index.js


