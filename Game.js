
// Variables \\
Game = {};
Game.scenes = [];
Game.scenes[1] = {};
Game.scenes[2] = {};
Game.layers = [];
Game.layers[1] = {};
Game.layers[2] = {};
Game.maze = {};
Game.frameCount = 0;
GRID_SIZE = 21;
TILE_SIZE = 40;

// Resources \\

Game.res = {
  snail_png: "assets/snail2.png",
  shrubwall_png: "assets/shrubwall.png",
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
    var size = cc.director.getWinSize();
    layer = cc.LayerColor.create(new cc.Color(47, 36, 30, 255), size.width, size.height);
    game.addChild(layer);
    Game.maze.setWalls(layer);
    Game.snail = new Snail();
    layer.addChild(Game.snail);
    var destination = Game.maze.end;
    var leaf = new cc.Sprite(Game.res.leaf_png);
    leaf.x = destination.x;
    leaf.y = destination.y;
    leaf.anchorX = 0;
    leaf.anchorY = 1;
    layer.addChild(leaf)
    Game.snail.findPath(destination.x, destination.y)
  }
})

Game.layers[2].extend = cc.Layer.extend({
  init: function(){
    this._super();
    var game = this;
    this.start(game)
  },
  start: function(game){
    var size = cc.director.getWinSize();
    layer = cc.LayerColor.create(new cc.Color(47, 36, 30, 255), size.width, size.height);
    game.addChild(layer);
    var splash = cc.Sprite.extend({
      ctor:function(){
        this._super();
        this.initWithFile(Game.res.snailsplash_png);
        this.x = 0;
        this.y = 0;
        this.anchorX = 0;
        this.anchorY = 0;
      }
    });
    layer.addChild(new splash());
    var title1 = cc.LabelTTF.create("Snail Escape!", "Arial", 90);
    title1.setPosition(size.width/2, 3*size.height/4);
    title1.setColor(new cc.Color(0, 0, 255, 0))
    layer.addChild(title1, 1)
    var title = cc.LabelTTF.create("Snail Escape!", "Arial", 90);
    title.setPosition(size.width/2 + 0.001*size.width, 3*size.height/4 - 0.001*size.height);
    layer.addChild(title, 1)
  }
})

var splash = cc.Sprite.extend({
  ctor:function(){
    this._super();
    this.initWithFile(Game.res.snailsplash_png);
    this.x = 0;
    this.y = 0;
    this.anchorX = 0;
    this.anchorY = 0;
  }
});




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
Game.scenes[2].extend = cc.Scene.extend({
  onEnter: function(){
    this._super();
    var layer = new Game.layers[2].extend();
    layer.init();
    this.addChild(layer);
    cc.eventManager.addListener({
			event: cc.EventListener.MOUSE,
	    onMouseDown: function(){
        cc.director.runScene(new Game.scenes[1].extend())
      }
		}, this);
  },
})

// Run Game \\

window.onload = function(){
  var targetWidth = GRID_SIZE*TILE_SIZE;
  var targetHeight = GRID_SIZE*TILE_SIZE;

  cc.game.onStart = function(){
    cc.view.adjustViewPort(false);
    cc.view.setDesignResolutionSize(targetWidth, targetHeight, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);

    cc.LoaderScene.preload(Game.g_resources, function () {
      cc.director.runScene(new Game.scenes[2].extend());
    }, this);

  };
  cc.game.run("gameCanvas");
  var rand = Math.ceil(Math.random()*4)
  var url = 'assets/mazes/maze' + rand +'.txt'
  console.log(url)
  fetch(url)
  .then(response => response.text())
  .then((data) => {
    Game.maze = new Maze(data)
  })
};
