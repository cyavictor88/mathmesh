NOTE: 
this package is farrrrr from being complete, but i think if it can help me, it might can help someone, too

Shortcomings:
1. It doesn't support sqrt / nth root, please use ^(1/n) instead  

To use:

        npm install mathmesh


<h3>What this package does:</h3>

Given a latex math string, returns its positions and indices (for babylonjs)  and vertices (for threejs bufferGeometry) 

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




It works in vite react, but for npm run build to work, you might need to add "NODE_OPTIONS=--max-old-space-size=4000 vite build" 

___


<h3>Local testing using Node Canvas</h3>


if you want build from source and to see how it draw out locally , you can simply:

1. Clone this repo
2. npm install
3. npm run build
4. remove "type":"module" in package.json
5. npm run test
6. open localhost:8081
7. you should see a picture:
![alt text](https://github.com/cyavictor88/mathmesh/blob/master/pics/example_nodecanvas.png?raw=true)

___

<h3>Remarks:</h3>
If you dig into the repo just a little bit, you can quickly notice I suck at git/npm workflow and coding. For example, I commit and push wayyy too frequent. And for npm versioning, I also publish wayyy too frequent. The code itself is also a mess. I think only I can read it coherently. I will try to improve and fix it. "IF" one day everything is up to standard and is production ready. I will probably just create a new repo and new npm package name, leaving this mess behind. i dunno... thats prob also not good software engineering. 
___


<h3>Special Thanks</h3>

Won't able to do it without this amazing repo: https://github.com/fetisov/ttf2mesh
