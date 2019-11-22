
// Variables \\
Game = {};
Game.scenes = [];
Game.scenes[1] = {};
Game.layers = [];
Game.layers[1] = {};
Game.maze = {};
Game.frameCount = 0;
GRID_SIZE = 21;
TILE_SIZE = 40;

// Resources \\

Game.res = {
  snail_png: "assets/snail2.png",
  shrubwall_png: "assets/shrubwall.png",
  maze_txt: "assets/maze.txt",
  snailsplash_png: "assets/snailsplash.png",
  leaf_png: "assets/leaf.png"
};

Game.g_resources = [];

for(var i in Game.res){
  Game.g_resources.push(Game.res[i]);
}


// Layers \\

Game.layers[1].extend = cc.Layer.extend({
  init: function(){
    this._super();
    var game = this;
    this.start(game)
  },
  start: function(game){
    console.log("Layer 1 start")
    var size = cc.director.getWinSize();
    layer = cc.LayerColor.create(new cc.Color(47, 36, 30, 255), size.width, size.height);
    game.addChild(layer);
    Game.maze.setWalls(layer);
    Game.snail = new Snail();
    layer.addChild(Game.snail);
    var destination = Game.maze.findGridLocation(19, 19);
    var leaf = new cc.Sprite(Game.res.leaf_png);
    leaf.x = destination.x;
    leaf.y = destination.y;
    leaf.anchorX = 0;
    leaf.anchorY = 1;
    layer.addChild(leaf)
    Game.snail.findPath(destination.x, destination.y)
  }
})


// Scenes \\

Game.scenes[1].extend = cc.Scene.extend({
  onEnter: function(){
    this._super();
    var layer = new Game.layers[1].extend();
    layer.init();
    this.addChild(layer);
    this.scheduleUpdate()
  },
  update: function(dt){
    Game.frameCount++
    Game.snail.traversePath();
  }
})

// Run Game \\

window.onload = function(){
  var targetWidth = 840;
  var targetHeight = 840;

  cc.game.onStart = function(){
    cc.view.adjustViewPort(false);
    cc.view.setDesignResolutionSize(targetWidth, targetHeight, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);

    cc.LoaderScene.preload(Game.g_resources, function () {
      cc.director.runScene(new Game.scenes[1].extend());
    }, this);

  };
  cc.game.run("gameCanvas");
  fetch('assets/maze.txt')
  .then(response => response.text())
  .then((data) => {
    Game.maze = new Maze(data)
  })
};
