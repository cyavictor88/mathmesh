const express = require('express')
const mathmesh = require('../dist/mathmesh.js');
const drawMathmesh = require('./genpic.js');
const app = express();
const port = 8081;
var rawstr = "qq=\\frac{99}{3}=\\frac{\\begin{bmatrix} a & b_{xyz} & \\frac{m}{n} \\\\  d^{qp} & e & foo \\end{bmatrix}}{\\begin{bmatrix} a & c \\end{bmatrix}}=\\text{a b}=\\begin{pmatrix} annnn^y & b_{44}  \\\\ 5^5_3 & zzzz  \\end{pmatrix}=\\int_{a}^{b} f(x) \\, dx = \\begin{cases} \\textrm{true,} & \\textrm{if } 0 < x_u < 35^{kmm} \\\\ \\textrm{false,} & \\textrm{otherwise} x^y \\end{cases} = \\oint_V f(s) = \\int_{a}^{b} f(x) \\, dx  =\\sum_{n=1}^{\\infty}n=\\lim_{x \\to \\infty} sin(x)";
// var rawstr = "\\int_{a}^{b}\\begin{bmatrix} m & efghij^n \\\\  \\frac{xssss}{sy} & k \\end{bmatrix} \\,dx";
// var rawstr = "\\frac{tttx}{y} \\textrm{hi ji}";
const  verts = mathmesh.mathmesh(rawstr);


app.get("/", (req, res) => {

  const image = drawMathmesh(rawstr,verts );
  
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

