NOTE: 
this package is farrrrr from being complete, but i think if it can help me, it might can help someone, too

To use:

        npm install mathmesh


<h3>What this package does:</h3>

given a latex math string, it returns its positions and indices (for babylon)  and vertices (for threejs bufferGeometry) 

ex:

      import {mathmesh} from "mathmesh";
      var mesh = mathmesh("\\int_{a}^{b}x^2 \\,dx");
      console.log(mesh)'

you will get:

    {
      positions: [ x1, y1, z1, x2, y2, z2, .....],
      indicies: [ # # # # # .....],
      vertices: Float32Array()
    }

___

<h4>to use in babylon:</h4>

    import {mathmesh} from "mathmesh";
    var verts = mathmesh("\\int_{a}^{b}x^2 \\,dx");
    let customMesh = new Mesh("mymathmesh", scene);
    let vertexData = new VertexData();

    vertexData.positions = verts.positions;
    vertexData.indices = verts.indices;
    vertexData.applyToMesh(customMesh);

    let fontmaterial = new StandardMaterial("mathmeshMat", scene);
    fontmaterial.backFaceCulling = false;
    fontmaterial.emissiveColor = new Color3(0, 1, 0);
    customMesh.material = fontmaterial;

![alt text](https://github.com/cyavictor88/mathmesh/blob/master/pics/example_babylon.png?raw=true)
---
<h4>to use in threejs (@react-three/fiber):</h4>

    import {mathmesh} from "mathmesh";
    const vertices = mathmesh("\\int_{a}^{b}x^2 \\,dx").vertices;
    ...
    <bufferGeometry >
      <bufferAttribute
            attach='attributes-position'
            array={vertices}
            count={vertices.length / 3}
            itemSize={3}
        /> 
    </bufferGeometry>

![alt text](https://github.com/cyavictor88/mathmesh/blob/master/pics/example_threejs.png?raw=true)
___


It works in create-react-app dev and production build.

It works in vite react dev, BUT DOESNT WORK in production build (Error is some type error, I think is because my messy work).

___
<h4>Other Basic Usage:</h4>

<h5>1.</h5>
in some dir:

$ npm init

in index.js:

    const mathmesh = require("mathmesh");
    console.log(mathmesh.mathmesh("\\frac{99}{3}"));


$ node index.js

---
<h5>2.</h5>
in some dir:

$ npm init

put  "type": "module",   in package.json

in index.js:

    import {mathmesh} from "mathmesh";
    console.log(mathmesh("\\frac{99}{3}"));

$ node index.js


___

<h3>Local testing using Node Canvas</h3>

if you want build from source and to see how it draw out locally , you can simply:

1. Clone this repo
2. npm install
3. npm run build
4. change the "rawstr" in test/server.js if you want
5. run $ node test/server.js (or better yet, $ npx nodemon test/server.js)
6. open localhost:8081
7. you should see a picture:
![alt text](https://github.com/cyavictor88/mathmesh/blob/master/pics/example_nodecanvas.png?raw=true)
