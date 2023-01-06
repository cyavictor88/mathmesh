import express from 'express';
import {mathmesh,mathmeshBoxAtLevel} from '../mathmesh';

import { drawMathmesh ,drawMathMeshWithBoundingBox, generateCanvasImgObj} from './generateCanvasImg';
// const mathmesh = require('../dist/mathmesh.js');
// // const drawMathmesh = require('./genpic.js');
// // const {otherMethod, drawMathmesh} = require('./genpic.js');
// const genpic= require('./genpic.js');
// const app = express();
// const port = 8081;
var rawstr = "\\vec{a_q}=\\frac{12345}{3}=\\frac{\\begin{bmatrix} \\vec{a} & b_{xyz} & \\frac{abcm^e}{n} \\\\  d^{qp} & e & foo \\end{bmatrix}}{\\begin{bmatrix} a & c \\end{bmatrix}}=\\text{a b}=\\begin{pmatrix} annnn^y & b_{44}  \\\\ 5^5_3 & zzzz  \\end{pmatrix}=\\int_{a}^{b} f(x) \\, dx = \\begin{cases} \\textrm{true,} & \\textrm{if } 0 < x_u < 35^{kmm} \\\\ \\textrm{false,} & \\textrm{otherwise} x^y \\end{cases} = \\oint_V f(s) = \\int_{a}^{b} f(x) \\, dx  =\\sum_{n=1}^{\\infty}n=\\lim_{x \\to \\infty} sin(x)";
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
  
