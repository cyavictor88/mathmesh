NOTE: 
this package is messy like spaghetti, but i think if it can help me, it might can help someone, too

What it lacks:
1. It doesn't support sqrt / nth root, please use ^(1/n) instead  

To use:

        npm install mathmesh


<h3>What this package does:</h3>
Given a latex math string, returns its positions and indices (for babylonjs) and vertices (for threejs bufferGeometry), also gives 2D mesh for framework like pixi js

<b>For 3D:</b>

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
    ...
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

Also tried in nextjs, runs fine
___

<b>For 2D:</b>

ex:

      import {mathmesh2D} from "mathmesh";
      var mesh = mathmesh2D("\\int_{a}^{b}x^2 \\,dx");
      console.log(mesh)'

you will get:

    {
      positions: [ x1, y1, x2, y2, .....],
      indicies: [ # # # # # .....],
      vertices: Float32Array(),
      triangles: [ 
        [ [t1_x0,t1_y0], [t1_x1, t1_y1] ,[t1_x2, t1_y2] ], 
        [ [t2_x0,t2_y0], [t2_x1, t2_y1] ,[t2_x2, t2_y2] ],
        ... ]
      aTextureCoord: number[];
      aVertexPosition: number[];  
    }

___

<h4>to use in 2D framework such as pixi js:</h4>

<h3>using aVertexPosition and aTextureCoord:</h3>

    import {mathmesh2D} from "mathmesh";
    ...
    const mesh2D = mathmesh2D("\\sum_{n=1}^{\\infty} 2^{-n} = 1")
    const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', mesh2D.aVertexPosition,2)
    .addAttribute('aTextureCoord', mesh2D.aTextureCoord,2)
    .addIndex(mesh2D.indices);  
    const greenColor = new PIXI.MeshMaterial(PIXI.Texture.WHITE, {
        tint: 0x00ff00, // Green color
    });
    const pixiMesh = new PIXI.Mesh(geometry, greenColor);
    app.stage.addChild(pixiMesh);

<h3>using triangles:</h3>

    import {mathmesh2D} from "mathmesh";
    ...
    const mesh2D = mathmesh2D("\\sum_{n=1}^{\\infty} 2^{-n} = 1")
    const mathmeshGraphics = new PIXI.Graphics();
    mathmeshGraphics.beginFill(0x000000);
    mesh2D.triangles.forEach( (tri: number[][]) => {
        mathmeshGraphics.moveTo(tri[0][0], tri[0][1] );
        mathmeshGraphics.lineTo(tri[1][0], tri[1][1] );
        mathmeshGraphics.lineTo(tri[2][0], tri[2][1] );
        mathmeshGraphics.lineTo(tri[0][0], tri[0][1] );
    });
    mathmeshGraphics.endFill();
    app.stage.addChild(mathmeshGraphics);

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
The code is a mess. I think only I can read it coherently(not anymore). I will try to improve and fix it.
___


<h3>Special Thanks</h3>

Won't able to do it without this amazing repo: https://github.com/fetisov/ttf2mesh
