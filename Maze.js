class Maze {
  constructor(data){
    this.rows = 0;
    this.cols = 0;
    this.tiles = [];
    this.parseMaze(data);
  }
  parseMaze(textData){
    var mazeArr = textData.split("\n")
    mazeArr = mazeArr.filter((l) => {return l.length > 0 && l.search(/\S/) != -1})
    var colCount = ((mazeArr[0].length - 1)/3)*2 + 1
    var rowCount = mazeArr.length
    var col;
    var tiles =[];
    for(var i = 0; i < mazeArr.length; i++){
      col = 0;
      for(var j = 0; j < mazeArr[i].length; j++){
        //skips every third character
        if((j+1)%3 == 0){
          continue;
        }
        if(mazeArr[i][j] == "+" || mazeArr[i][j] == "-" || mazeArr[i][j] == "|"){
          tiles.push({col: col, row: i})
        }
        col += 1;
      }
    }
    this.rows = rowCount;
    this.cols = colCount;
    this.tiles = tiles;
    this.start = this.findGridLocation(0,1);
    this.end = this.findGridLocation(colCount-1, rowCount-2)
  }
  setWalls(layer){
    var size = cc.director.getWinSize();

    for(var tile of this.tiles){
      var wall = new cc.Sprite(Game.res.shrubwall_png);
      wall.attr({
        x: TILE_SIZE*tile.col,
        y: size.height - TILE_SIZE*tile.row,
        anchorX: 0,
        anchorY: 1,
        scale: 1,
      });
      layer.addChild(wall);
    }
  }
  findGridLocation(col, row){
    var size = cc.director.getWinSize();
    var x = col*TILE_SIZE;
    var y = size.height-row*TILE_SIZE
    return({x:x, y:y})
  }
}
