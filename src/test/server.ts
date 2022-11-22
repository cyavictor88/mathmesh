import express from 'express';
import {mathmesh,mathmeshBoxAtLevel} from '../mathmesh';

import { drawMathmesh ,drawMathMeshWithBoundingBox, generateCanvasImgObj} from './generateCanvasImg';
// const mathmesh = require('../dist/mathmesh.js');
// // const drawMathmesh = require('./genpic.js');
// // const {otherMethod, drawMathmesh} = require('./genpic.js');
// const genpic= require('./genpic.js');
// const app = express();
// const port = 8081;
var rawstr = "\\int_{w}^{r}x^2+2 \\,dx"
const verts:any =  mathmesh(rawstr)
const bbox:any =  mathmeshBoxAtLevel(rawstr,1);
const app = express();
const port = 8081;


app.get("/", (req, res) => {
    // res.send('Hellddo World')
    // const image = drawMathmesh(rawstr,verts );
    // var mathmeshImg = new genpic(rawstr,verts,mmobj.generateBoundingBoxAtText());
    // var mathmeshImg = new genpic(rawstr,verts);
    // const image = mathmeshImg.drawMathMeshWithBoundingBox();
    var mathmeshImg = new generateCanvasImgObj(rawstr,verts);
    // var mathmeshImg = new generateCanvasImgObj(rawstr,verts);
    const image = mathmeshImg.objdrawMathmesh();
    // const image = mathmeshImg.objdrawMathMeshWithBoundingBox();
    res.writeHead(
      200,
      //this is the headers object
      {
        //content-type: image/jpg tells the browser to expect an image
        "Content-Type": "image/jpg",
      }
    );
    //ending the response by sending the image buffer to the browser
    res.end(image);
  }
  );
  //start the web server listening
  app.listen(port, () => {
    console.log(`Mathmesh local display server at: ${port}`);
  });
  
