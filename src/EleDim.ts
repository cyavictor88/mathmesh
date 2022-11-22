import { LBlockType, MathmlParser as MP, MMFlatStruct, TabInfo } from './mathmlParser';
// import { create, all,MathArray, MathType } from 'mathjs'



import * as mathjs from 'mathjs';
import * as lodash from 'lodash';

// const config = {
//    
//   }
// const math = create(all, config);

export interface Dim {
    scale: number,
    xs: [number, number],
    ys: [number, number]

    text?: string,
    nullspace?: boolean,
}

export class EDim {

    public dim: Dim ={
        scale: 1,
        xs: [0, 0],
        ys: [0, 0]
    } ;
    public grandFlatArr: MMFlatStruct[] | [] = [];
    public block: MP.LBlock | null = null;
    constructor();
    constructor(grandFlatArr: MMFlatStruct[], block: MP.LBlock);
    constructor(grandFlatArr?: MMFlatStruct[], block?: MP.LBlock) {
        if (grandFlatArr) {
            this.grandFlatArr = grandFlatArr;
        }
        if (block) {
            this.block = block;
            this.dim = this.setDim();
            block.edim = this;

            if (block.type == LBlockType.mtd) {

                this.adjustTable();
            }
        }
        

    }
    adjustForFence(openorclose: boolean, tableBlock: MP.LBlock): number {
        //webpack console.log("adusting for fenceeeeeee ",this.block.text)
        //webpack console.log(tableBlock.type);
        //webpack console.log(tableBlock.edim.dim);
        let newscale = tableBlock!.edim!.dim!.ys[1] - tableBlock!.edim!.dim!.ys[0];
        // let newscale=1;
        // newscale=1;
        let orixlen = this.dim!.xs[1] - this.dim!.xs[0];
        let delx = (newscale * orixlen - orixlen) / 1.5;
        this.spatialTransSingleEle({ delx: 0, dely: newscale / 10 }, 1);
        this.dim!.scale = newscale;
        if (openorclose)
            tableBlock!.edim!.spatialTransSingleEle({ delx: delx, dely: 0 }, 1);
        return delx
        // for(let i =idxgonnabepushed;i<this.grandFlatArr.length;i++)
        // {
        //     this.grandFlatArr[i].refLblock.edim.spatialTransSingleEle({delx: delx, dely:0}, 1);
        // }
        // let aidx = lvlstack[lvlbidx[0]].idxInArray;
        // this.block.parent.children.forEach( (child)=>{
        //     if(!(child.uuid==this.block.uuid||child.uuid==tableBlock.uuid))
        //         child.edim.spatialTrans({delx: delx, dely:0}, 1);
        // });

        // for (let i=lvlbidx;i<lvlstack.length;i++)
        // {
        //     if (lvlstack[i].lvl-1==this.block.lvl)
        //     {
        //         //lvlstack[i].edim.spatialTrans({delx: delx, dely:0}, 1);
        //     }
        // }
    }
    adjustTable() {
        let ownedDetail = lodash.findLast(this.grandFlatArr[this.block!.idxInArray].ownedDetails, function (o) { return o.tabDetail != null; })
        if (!!ownedDetail && !!(ownedDetail.tabDetail)) {



            let rows = ownedDetail.tabDetail.tab.rows;
            let cols = ownedDetail.tabDetail.tab.cols;
            let rowidx = ownedDetail.tabDetail.rowIdx;
            let colidx = ownedDetail.tabDetail.colIdx;
            let tab = ownedDetail.tabDetail.tab;
            let tabEdims = tab.tabEdimCoords;
            if (!!rows && !!tabEdims) {


                let xys = tabEdims[rowidx][colidx].dim
                if (rowidx == rows - 1) return;

                // find max xinterval (constant col, from current row to last row)
                let maxx = xys!.xs[1] - xys!.xs[0];
                let maxx1 = xys!.xs[1];
                let maxx0 = xys!.xs[0];


                for (let i = rowidx + 1; i < rows; i++) {
                    let tmpele = tabEdims[i][colidx]
                    if (tmpele!.dim!.xs[1] - tmpele!.dim!.xs[0] > maxx) {
                        maxx = tmpele!.dim!.xs[1] - tmpele!.dim!.xs[0];
                        maxx1 = tmpele!.dim!.xs[1];
                        maxx0 = tmpele!.dim!.xs[0];
                    }

                }

                // with max xinterval, starting from current col, expand rows at current col
                for (let i = rowidx; i < rows; i++) {

                    let tmpEdim = tabEdims[i][colidx];
                    let delx1 = this.getDelX_for_put_in_center_of_bigger_xs(tmpEdim!.dim!.xs[0], tmpEdim!.dim!.xs[1], maxx0, maxx1)
                    if (delx1 > 0) {
                        ////webpack console.log(tmpEdim.dim.xs[0]);
                    }
                    let curx0 = tmpEdim!.dim!.xs[0];
                    tmpEdim.spatialTrans({ delx: -delx1, dely: 0 }, 1);
                    if (delx1 > 0) {
                        ////webpack console.log(tmpEdim.dim.xs[0]);
                    }
                    if (i == rowidx) {////webpack console.log("del1",delx1,rowidx,rows);
                        continue;
                    };
                    // fix col infront of cur col
                    for (let j = 0; j < colidx; j++) {
                        let tmpEdim2 = tabEdims[i][j];
                        let distanceBetweenMaxx0AndBeforetmpEdimx0 = Math.abs(maxx0 - curx0);
                        let del2 = -distanceBetweenMaxx0AndBeforetmpEdimx0;
                        tmpEdim2.spatialTrans({ delx: del2, dely: 0 }, 1);
                    }
                }
            }
        }
    }

    getbounds() {

        return [[this.dim!.xs[0], this.dim!.ys[0]], [this.dim!.xs[1], this.dim!.ys[1]]]
    }





    scaleAndMove(newscale: number, delx: number, dely: number) {

        let newscaleM = mathjs.multiply(mathjs.identity(3), newscale) as mathjs.MathArray;

        let scaledxs = mathjs.multiply(newscaleM, [this.dim.xs[0], this.dim.xs[1], 1]);
        // let scaledys:MathArray = math.multiply(newscaleM,  [ this.dim.ys[0],this.dim.ys[1],1 ] );

        //     //webpack console.log(scaledxs.at[0],scaledxs.at[1]);

        // let newxs = this.getSpatialTransArr(this.dim.xs,)




        let scaledxlen = newscale * (this.dim.xs[1] - this.dim.xs[0]);
        let scaledylen = newscale * (this.dim.ys[1] - this.dim.ys[0]);

        this.dim.xs[0] += (delx);
        this.dim.xs[1] = this.dim.xs[0] + scaledxlen;
        this.dim.ys[0] += dely;
        this.dim.ys[1] = this.dim.ys[0] + scaledylen;
        this.dim.scale = this.dim.scale * newscale;

        // change to bfs instead of dfs
        if (this.block && this.block.children != null) {
            this.block.children.forEach((child, idx) => {
                child!.edim!.scaleAndMove(newscale, delx, dely);
            });
        }

    }

    get_xyBounds_from_children(): { xs: [number, number], ys: [number, number] } {
        let y0 = Number.MAX_SAFE_INTEGER;
        let y1 = Number.MIN_SAFE_INTEGER;
        let x0 = Number.MAX_SAFE_INTEGER;
        let x1 = Number.MIN_SAFE_INTEGER;
        //let x1 = 
        this.block!.children!.forEach(child => {
            let dim = child!.edim!.dim;
            if (dim.ys[0] < y0) y0 = dim.ys[0];
            if (dim.ys[1] > y1) y1 = dim.ys[1];
            if (dim.xs[0] < x0) x0 = dim.xs[0];
            if (dim.xs[1] > x1) x1 = dim.xs[1];
        });
        return { xs: [x0, x1], ys: [y0, y1] };

    }

    setDim(): Dim {
        let block = this.block;
        if(!block)return { scale: 1, xs: [0,0], ys: [0,0] };
        let eleinArray = this.grandFlatArr[block.idxInArray];
        // //webpack console.log(block.lvl, block.type,block.text);

        // if(eleinArray.attriArr!=null!=null)
        // {
        //     eleinArray.attriArr!=null.forEach(element => {
        //         if(element.name==='fence')
        //         {
        //             //webpack console.log(block.lvl, block.type);
        //             //webpack console.log(element.name,element.val);

        //         }
        //     });
        // }

        // mfrac
        if (block.type == MP.LBlockType.mfrac) {
            let baseEle_y0 = 0;
            let baseEle_y1 = 0;
            let baseEle_x1 = 0;
            let baseEle_x0 = 0;
            block.children!.forEach((child, idx) => {
                let dim = child.edim!.dim;
                let eleinArray = this.grandFlatArr[child.idxInArray];
                let ownedDetailed = lodash.find(eleinArray.ownedDetails, function (o) { return o.owner.uuid === block!.uuid; });
                ////webpack console.log(ownedDetailed);
                // if (idx == 0) {
                if (ownedDetailed!.pos == MP.Position.Mid) {
                    baseEle_x1 = dim.xs[1];
                    baseEle_y0 = dim.ys[0];
                    baseEle_y1 = dim.ys[1];
                    baseEle_x0 = dim.xs[0];

                }
                // else if (idx == 1) {
                else if (ownedDetailed!.pos == MP.Position.Down) {
                    let newscale = 1;// .65;
                    let delx = baseEle_x0 - dim.xs[0];
                    let dely = - (newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 0.9);
                    child.edim!.spatialTrans({ delx: delx, dely: dely }, newscale);
                }
                // else if (idx == 2) {
                else if (ownedDetailed!.pos == MP.Position.Up) {
                    let newscale = 1;// .65;
                    let delx = baseEle_x0 - dim.xs[0];
                    let dely = newscale * dim.scale * (baseEle_y1 - baseEle_y0) / 1.5;
                    child.edim!.spatialTrans({ delx: delx, dely: dely }, newscale);
                }
            });
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }


        // munderover munder mover
        if (block.type == MP.LBlockType.munderover || block.type == MP.LBlockType.mover || block.type == MP.LBlockType.munder) {
            let baseEle_y0 = 0;
            let baseEle_y1 = 0;
            let baseEle_x1 = 0;
            let baseEle_x0 = 0;

            block.children!.forEach((child, idx) => {
                let dim = child.edim!.dim;
                let eleinArray = this.grandFlatArr[child.idxInArray];
                let ownedDetailed = lodash.find(eleinArray.ownedDetails, function (o) { return o.owner.uuid === block!.uuid; });
                ////webpack console.log(ownedDetailed);
                // if (idx == 0) {
                if (ownedDetailed!.pos == MP.Position.Mid) {
                    baseEle_x1 = dim.xs[1];
                    baseEle_y0 = dim.ys[0];
                    baseEle_y1 = dim.ys[1];
                    baseEle_x0 = dim.xs[0];

                }
                // else if (idx == 1) {
                else if (ownedDetailed!.pos == MP.Position.Down) {
                    let newscale = .65;
                    let delx = baseEle_x0 - dim.xs[0];
                    let dely = -(newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 1);
                    child.edim!.spatialTrans({ delx: delx, dely: dely }, newscale);
                }
                // else if (idx == 2) {
                else if (ownedDetailed!.pos == MP.Position.Up) {
                    let newscale = .65;
                    let delx = baseEle_x0 - dim.xs[0];
                    let dely = (baseEle_y1 - baseEle_y0);
                    child.edim!.spatialTrans({ delx: delx, dely: dely }, newscale);
                }
            });
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }



        // mi mo mn mtext mfracmid
        if (block.type == MP.LBlockType.mfracmid || block.type == MP.LBlockType.mi || block.type == MP.LBlockType.mo || block.type == MP.LBlockType.mn || block.type == MP.LBlockType.mtext) {
            let textstr = block.text!.toString();
            let dizscale = 1;
            if (textstr === "∮" || textstr === "∫") // make integral symbol bigger
                dizscale = 1.5;

            return { scale: dizscale, xs: [0, textstr.length * dizscale], ys: [0.5 - dizscale / 2, 0.5 + dizscale / 2], text: textstr };
        }

        // mstyle
        if (block.type == MP.LBlockType.mstyle) {
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }

        // mrow
        if (block.type == MP.LBlockType.mrow) {
            let y0 = Number.MAX_SAFE_INTEGER;
            let y1 = Number.MIN_SAFE_INTEGER;
            let x0 = block.children![0].edim!.dim.xs[0];
            block.children!.forEach((child) => {
                let childDim = child.edim!.dim;
                child.edim!.spatialTrans({ delx: x0 - childDim.xs[0], dely: 0 }, 1);
                if (childDim.ys[0] < y0) y0 = childDim.ys[0];
                if (childDim.ys[1] > y1) y1 = childDim.ys[1];
                x0 = child.edim!.dim.xs[1];
            });
            let bchilren = block!.children
                let x1 = bchilren![bchilren!.length-1].edim!.dim.xs[1];

            return { scale: 1, xs: [block!.children![0].edim!.dim.xs[0], x1], ys: [y0, y1] };

        }

        // msubsup msub msup
        if (block.type == MP.LBlockType.msubsup || block.type == MP.LBlockType.msub || block.type == MP.LBlockType.msup) {
            let baseEle_y0 = 0;
            let baseEle_y1 = 0;
            let baseEle_x1 = 0;
            block.children!.forEach((child, idx) => {
                let dim = child.edim!.dim;
                let eleinArray = this.grandFlatArr[child.idxInArray];
                let ownedDetailed = lodash.find(eleinArray.ownedDetails, function (o) { return o.owner.uuid === block!.uuid; })!;
                ////webpack console.log(ownedDetailed);
                // if (idx == 0) {
                if (ownedDetailed.pos == MP.Position.Mid) {
                    baseEle_x1 = dim.xs[1];
                    baseEle_y0 = dim.ys[0];
                    baseEle_y1 = dim.ys[1];
                }
                // else if (idx == 1) {
                else if (ownedDetailed.pos == MP.Position.Down) {
                    let newscale = .65;
                    let delx = baseEle_x1 - dim.xs[0];
                    let dely = baseEle_y0 - (newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    child.edim!.spatialTrans({ delx: delx, dely: dely }, newscale);
                }
                // else if (idx == 2) {
                else if (ownedDetailed.pos == MP.Position.Up) {
                    let newscale = .65;
                    let delx = baseEle_x1 - dim.xs[0];
                    let dely = baseEle_y0 + (baseEle_y1 - baseEle_y0) - 0.5 * (newscale * dim.scale * (dim.ys[1] - dim.ys[0]) / 2);
                    child.edim!.spatialTrans({ delx: delx, dely: dely }, newscale);
                }
            });
            let xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }



        // mtr mtable
        if (block.type == MP.LBlockType.mtr || block.type == MP.LBlockType.mtable) {
            let xys = this.get_xyBounds_from_children();
            ////webpack console.log(xys);
            return { scale: 1, xs: xys.xs, ys: xys.ys };
        }

        // mtd
        if (block.type == MP.LBlockType.mtd) {

            let ownedDetail = lodash.findLast(this.grandFlatArr[block.idxInArray].ownedDetails, function (o) { return o.tabDetail != null; })!
            let rows = ownedDetail.tabDetail!.tab.rows!;
            let cols = ownedDetail.tabDetail!.tab.cols!;
            let rowidx = ownedDetail.tabDetail!.rowIdx!;
            let colidx = ownedDetail.tabDetail!.colIdx!;
            let tab = ownedDetail.tabDetail!.tab;
            let tabEdims = tab.tabEdimCoords;
            let xys = this.get_xyBounds_from_children();
            tabEdims![rowidx][colidx] = this;

            //last row and loast col
            if (rowidx == rows - 1 && colidx == cols - 1) {
                return { scale: 1, xs: xys.xs, ys: xys.ys };
            }

            // last row
            if (rowidx == rows - 1) {
                let xbuff = 0.5;
                let realx1Pos = tabEdims![rowidx][colidx + 1].dim.xs[0] - xbuff;
                let delx = realx1Pos - xys.xs[1];
                block.children![0].edim!.spatialTrans({ delx: delx, dely: 0 }, 1);
                xys = this.get_xyBounds_from_children();
                return { scale: 1, xs: xys.xs, ys: xys.ys };
            }

            //  entries above last row
            let ybuff = 0.2;
            let lowerRowy1Max = Number.MIN_SAFE_INTEGER;
            let realy0Pos: number;
            for (let j = 0; j < cols; j++) {
                if (tabEdims![rowidx + 1][j].dim.ys[1] > lowerRowy1Max)
                    lowerRowy1Max = tabEdims![rowidx + 1][j].dim.ys[1];
            }
            realy0Pos = ybuff + lowerRowy1Max;
            let dely = realy0Pos - xys.ys[0];

            //align to right(x1)
            let sameColmaxx1 = Number.MIN_SAFE_INTEGER;
            let realx1Pos: number;
            for (let i = rowidx + 1; i < rows; i++) {
                if (tabEdims![i][colidx].dim.xs[1] > sameColmaxx1)
                    sameColmaxx1 = tabEdims![i][colidx].dim.xs[1];
            }


            realx1Pos = sameColmaxx1;
            let delx = realx1Pos - xys.xs[1];
            block!.children![0].edim!.spatialTrans({ delx: delx, dely: dely }, 1);
            xys = this.get_xyBounds_from_children();
            return { scale: 1, xs: xys.xs, ys: xys.ys };





        }
        return { scale: 1, xs: [0,0], ys: [0,0] };

    }

    getDelX_for_put_in_center_of_bigger_xs(x0: number, x1: number, x0bigger: number, x1bigger: number): number {

        let l = ((x1bigger - x0bigger) - (x1 - x0)) / 2
        let delx = x0 - l - x0bigger;
        return delx;
    }
    getTabInfoUsingRowIdxColIdx(tab: MMFlatStruct, rowIdx: number, colIdx: number): TabInfo {
        this.grandFlatArr.forEach(ele => {
            if (ele.ownedDetails != null && ele.ownedDetails.length > 0) {
                let owndet = lodash.findLast(ele.ownedDetails, function (p) {
                    return p.tabDetail != null && p.tabDetail.tab.uuid == tab.uuid &&
                        p.tabDetail.rowIdx == rowIdx && p.tabDetail.colIdx == colIdx
                })
                if (owndet != undefined) {
                    return owndet.tabDetail;
                }
            }
        });
        return { tab: this.grandFlatArr[0], rowIdx: 0, colIdx: 0 };

    }
    spatialTransSingleEle(trans: { delx: number, dely: number }, newscale: number) {
        this.dim.scale *= newscale;
        let transMat = mathjs.multiply(mathjs.identity(3), newscale) as mathjs.Matrix;
        transMat.subset(mathjs.index([0, 1, 2], [2]), [[trans.delx], [trans.dely], [1]]);
        this.getbounds().forEach((b, idx) => {
            let tmpmat = mathjs.multiply(transMat, mathjs.matrix([[b[0]], [b[1]], [1]])) as mathjs.Matrix;
            this.dim.xs[idx] = tmpmat.get([0, 0]) as number;
            this.dim.ys[idx] = tmpmat.get([1, 0]) as number;
        });

    }

    spatialTrans(trans: { delx: number, dely: number }, newscale: number) {
        // let mat = Matrix.Identity();
        // mat.setRowFromFloats(0, newscale, 0, 0, trans.delx);
        // mat.setRowFromFloats(1, 0, newscale, 0, trans.dely);
        // mat.setRowFromFloats(2, 0, 0, newscale, 0);
        // let bounds = this.getbounds();
        // bounds.forEach((b, idx) => {
        //     let tmpmat = new Matrix();
        //     tmpmat.setRow(0, new Vector4(b[0], b[1], 0, 1));
        //     tmpmat = tmpmat.transpose();
        //     tmpmat = mat.multiply(tmpmat);
        //     this.dim.xs[idx]=tmpmat.getRow(0).asArray()[0];
        //     this.dim.ys[idx]=tmpmat.getRow(1).asArray()[0];
        // });

        // using mathjs to setup transMat matrix
        this.dim.scale *= newscale;
        let transMat = mathjs.multiply(mathjs.identity(3), newscale) as mathjs.Matrix;
        transMat.subset(mathjs.index([0, 1, 2], [2]), [[trans.delx], [trans.dely], [1]]);
        this.getbounds().forEach((b, idx) => {
            let tmpmat = mathjs.multiply(transMat, mathjs.matrix([[b[0]], [b[1]], [1]])) as mathjs.Matrix;
            this.dim.xs[idx] = tmpmat.get([0, 0]) as number;
            this.dim.ys[idx] = tmpmat.get([1, 0]) as number;
        });

        if (this.block!.children != null) {
            this.block!.children.forEach((child, idx) => {
                child.edim!.spatialTrans(trans, newscale);
            });
        }
    }

}



export * as EleDim from './EleDim';
