/**
* Author
 @Inateno / http://inateno.com / http://dreamirl.com

* ContributorsList
 @Inateno

***
simple Game declaration
**/

import DE from '@dreamirl/dreamengine';

var Game = {};

Game.render = null;
Game.scene = null;
Game.obj = null;

var jump = true;
var onGround = true;
var plateforme = [];
var collectible = [];
var nbPiece = 0;
var collect;
var contactPiece = false;
var lastPosCollectible = 0;
var projectileTab = [];
var lancementProj = true;
var projSpwanRate = 1000;
var btnRetry = null;
var isRestart = false;

Game.init = function () {
    console.log('game init');
    // DE.config.DEBUG = 1;
    // DE.config.DEBUG_LEVEL = 2;

    // Create the renderer before assets start loading
    Game.render = new DE.Render('render', {
        resizeMode: 'stretch-ratio',
        width: 1920,
        height: 1080,
        backgroundColor: '0x00004F',
        roundPixels: false,
        powerPreferences: 'high-performance',
    });
    Game.render.init();

    DE.start();
};

Game.onload = function () {
    console.log('game start');

    // scene
    Game.scene = new DE.Scene();

    var collectibleManager = new DE.GameObject({
        spawnCollect: function () {
            if (collectible.length == 0) {
                do {
                    var temp = Math.floor(Math.random() * plateforme.length)
                } while (temp == lastPosCollectible);
                lastPosCollectible = temp;
                var plat = plateforme[temp];
                createPiece(plat.x + plat.renderer.width / 2, plat.y - 35);
            }
        },
        automatisms: [['spawnCollect', 'spawnCollect']]
    })
    Game.scene.add(collectibleManager);

    //var projectileManager = new DE.GameObject({
    //    spawnProj: function () {
    //        if (projectile.length == 0) {
    //            //projectile.add(new GameObject());
    //            var coord;
    //            var nb = Math.random();
    //            if (nb > 0.5) {
    //                coord = Math.floor(Math.random() * 1920 - 200);
    //                if (nb > 0.25) {
    //                    createProjectile(coord, "top");
    //                    console.log("top");
    //                } else {
    //                    createProjectile(coord, "bottom");
    //                    console.log("bottom");
    //                }
    //            } else {
    //                coord = Math.floor(Math.random() * 1080 - 200);
    //                if (nb > 0.75) {
    //                    createProjectile(coord, "right");
    //                    console.log("right");
    //                } else {
    //                    createProjectile(coord, "left");
    //                    console.log("left");
    //                }
    //            }
    //        }
    //    },
    //    automatisms: [['spawnProj', 'spawnProj']],
    //});
    //Game.scene.add(projectileManager);


    // don't do this because DisplayObject bounds is not set to the render size but to the objects inside the scene
    // scene.interactive = true;
    // scene.click = function()
    // {
    //   console.log( "clicked", arguments );
    // }

    // if no Camera, we add the Scene to the render (this can change if I make Camera)

    Game.camera = new DE.Camera(0, 0, 1920, 1080, {
        scene: Game.scene,
        backgroundImage: 'bg',
    });
    Game.camera.interactive = true;
    Game.camera.pointermove = function (pos, e) {
        Game.targetPointer.moveTo(pos, 100);
    };
    Game.camera.pointerdown = function (pos, e) {
        // Deplace le projectile
        // Game.ship.gameObjects[0].moveTo(Game.targetPointer, 500);
        Game.targetPointer.renderer.setBrightness([1, 0]);
    };
    Game.camera.pointerup = function (pos, e) {
        console.log('up');
        Game.targetPointer.shake(10, 10, 200);
    };
    Game.targetPointer = new DE.GameObject({
        zindex: 500,
        renderer: new DE.SpriteRenderer({ spriteName: 'target', scale: 0.3 }),
    });
    Game.render.add(Game.camera);

    Game.projManager;
    Game.projManager = new DE.GameObject({
        x: 0,
        y: 0,
        verif: function () {
            var indexASupp = null;
            projectileTab.forEach(function (item, index, array) {
                if (item.lancer == true) {
                    setTimeout(() => { item.lancer = true; }, 500);
                }
                if (item.aSupp == true) {
                    indexASupp = index;
                }
            })
            if (indexASupp != null) {
                Game.scene.remove(projectileTab[indexASupp]);
                projectileTab.splice(indexASupp, 1);
            }
            if (lancementProj == true) {
                lancementProj = false;
                setTimeout(() => { createProj(Math.floor(Math.random() * 1720 + 200)); lancementProj = true }, projSpwanRate--);
            }
        },
        automatisms: [['verif', 'verif']],
    });

    Game.scene.add(Game.projManager);

    Game.player;
    Game.player = new DE.GameObject({
        x: 240,
        y: 1000,
        scale: 3,
        renderers: [
            new DE.SpriteRenderer({ spriteName: 'playerLoop', loop: true, }),
            new DE.TextRenderer('', {
                localizationKey: 'player.data.realname',
                y: -20,
                textStyle: {
                    fill: 'white',
                    fontSize: 10,
                    fontFamily: 'Snippet, Monaco, monospace',
                    strokeThickness: 1,
                    align: 'center',
                },
            }),
        ],
        axes: { x: 0, y: 0 },
        interactive: true,
        checkInputs: function () {
            this.translate({ x: this.axes.x * 2, y: this.axes.y * 2 });
            var test = false;
            plateforme.forEach(function (item, index, array) {
                if (boxesIntersect(Game.player.gameObjects[4], item)) {
                    onGround = true;
                    test = true;
                };
                if (test == false) {
                    onGround = false;
                }
                if (boxesIntersect(Game.player.gameObjects[3], item)) {
                    Game.player.axes.x = 0;
                }
                if (boxesIntersect(Game.player.gameObjects[2], item)) {
                    Game.player.axes.x = 0;
                }
                if (boxesIntersect(Game.player.gameObjects[1], item)) {
                    Game.player.axes.y = 0;
                }
            })
            collectible.forEach(function (item, index, array) {
                if (boxesIntersect(Game.player.gameObjects[0], item)) {
                    Game.scene.remove(item);
                    collect == item;
                    contactPiece = true;
                }
            })
            projectileTab.forEach(function (item, index, array) {
                if (boxesIntersect(Game.player.gameObjects[0], item)) {
                    Game.TextNbCollect = new DE.GameObject({
                        x: 900,
                        y: 400,
                        renderers: [
                            new DE.TextRenderer('Game over', {
                                //localizationKey: 'player.data.realname',
                                textStyle: {
                                    fill: 'black',
                                    fontSize: 72,
                                    fontFamily: 'Snippet, Monaco, monospace',
                                    strokeThickness: 1,
                                    align: 'center',
                                },
                            }),
                        ],
                    });
                    Game.scene.add(Game.TextNbCollect);
                    Game.btnRetry = new DE.GameObject({
                        x: 900,
                        y: 800,
                        renderers: [
                            new DE.RectRenderer(200, 100, '0x' + '646665', {
                                //lineStyle: [4, '0xFF3300', 1],
                                //fill: true,
                                x: -100,
                                y: -50,
                                alpha: 1,
                            }),
                            new DE.TextRenderer('Retry', {
                                //localizationKey: 'player.data.realname',
                                textStyle: {
                                    fill: 'black',
                                    fontSize: 72,
                                    fontFamily: 'Snippet, Monaco, monospace',
                                    strokeThickness: 1,
                                    align: 'center',
                                },
                            }),
                        ],
                        retry: function () {
                            DE.Inputs.on('keyDown', 'fire', function () {
                                location.reload();
                            });
                        },
                        automatisms: [['retry', 'retry']],
                    });
                    Game.scene.add(Game.btnRetry);
                    btnRetry = Game.btnRetry;

                    Game.scene.remove(Game.player);
                }
            })
            if (contactPiece) {
                collectible.splice(collectible.indexOf(collect), 1);
                contactPiece = false;
                nbPiece++;
                Game.TextNbCollect.renderers[0].text = "Nombre de piece : " + nbPiece;

            }
            if ((this.y < 1080 - 48) && !onGround) {
                this.translate({ x: this.axes.x, y: this.axes.y + 4 });
            } else {
                jump = true;
            }

        },
        automatisms: [['checkInputs', 'checkInputs']],
        // automatisms: [['isOnGround', 'isOnGround']],
        gameObjects: [
            new DE.GameObject({
                _staticPosition: true,
                x: -4,
                y: 15,
                renderer: new DE.RectRenderer(10, 1, '0x' + 'FDCCFC', {
                    //lineStyle: [4, '0xFF3300', 1],
                    //fill: true,
                    //x: 0,
                    //y: 0,
                    alpha: 0,
                }),
            }),
            new DE.GameObject({
                _staticPosition: true,
                x: 8,
                y: -4,
                renderer: new DE.RectRenderer(1, 16, '0x' + 'FDCCFC', {
                    //lineStyle: [4, '0xFF3300', 1],
                    //fill: true,
                    //x: 0,
                    //y: 0,
                    alpha: 0,
                }),
            }),
            new DE.GameObject({
                _staticPosition: true,
                x: -8,
                y: -4,
                renderer: new DE.RectRenderer(1, 16, '0x' + 'FDCCFC', {
                    //lineStyle: [4, '0xFF3300', 1],
                    //fill: true,
                    //x: 0,
                    //y: 0,
                    alpha: 0,
                }),
            }),
            new DE.GameObject({
                _staticPosition: true,
                x: -4,
                y: -10,
                renderer: new DE.RectRenderer(10, 1, '0x' + 'FDCCFC', {
                    //lineStyle: [4, '0xFF3300', 1],
                    //fill: true,
                    //x: 0,
                    //y: 0,
                    alpha: 0,
                }),
            }),
            new DE.GameObject({
                _staticPosition: true,
                x: -8,
                y: -8,
                renderer: new DE.RectRenderer(16, 24, '0x' + 'FFFFFF', {
                    //lineStyle: [4, '0xFF3300', 1],
                    //fill: true,
                    //x: 0,
                    //y: 0,
                    alpha: 0,
                }),
            }),
        ]
    });


    Game.TextNbCollect;

    Game.TextNbCollect = new DE.GameObject({
        x: 100,
        y: 100,
        renderers: [
            new DE.TextRenderer('"Nombre de piece : 0', {
                //localizationKey: 'player.data.realname',
                textStyle: {
                    fill: 'black',
                    fontSize: 34,
                    fontFamily: 'Snippet, Monaco, monospace',
                    strokeThickness: 1,
                    align: 'center',
                },
            }),
        ],
    });
    Game.TextNbCollect.renderers[0].text = "Nombre de piece : " + nbPiece;

    Game.scene.add(Game.TextNbCollect);


    var a = new DE.GameObject({
        _staticPosition: true,
        x: 700,
        y: 1000,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(a);
    plateforme.push(a);

    var b = new DE.GameObject({
        _staticPosition: true,
        x: 250,
        y: 800,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(b);
    plateforme.push(b);

    var c = new DE.GameObject({
        _staticPosition: true,
        x: 1150,
        y: 800,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(c);
    plateforme.push(c);

    var d = new DE.GameObject({
        _staticPosition: true,
        x: 700,
        y: 600,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(d);
    plateforme.push(d);

    var e = new DE.GameObject({
        _staticPosition: true,
        x: 250,
        y: 400,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(e);
    plateforme.push(e);

    var f = new DE.GameObject({
        _staticPosition: true,
        x: 1150,
        y: 400,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(f);
    plateforme.push(f);

    var g = new DE.GameObject({
        _staticPosition: true,
        x: 700,
        y: 200,
        renderer: new DE.RectRenderer(400, 25, '0x' + 'CDCCFC', {
            //lineStyle: [4, '0xFF3300', 1],
            //fill: true,
            //x: -20,
            //y: -35,
        }),
    });
    Game.scene.add(g);
    plateforme.push(g);


    Game.scene.add(
        Game.player,
    );

    DE.Inputs.on('keyDown', 'down', function () {
        console.log("Collide : " + boxesIntersect(Game.player.gameObjects[0], a));
    });

    DE.Inputs.on('keyDown', 'util', function () {
        console.log(boxesIntersect(Game.player.gameObjects[0], collectible[0].trigger[0]));
    });

    //DE.Inputs.on('keyDown', 'fire', function () {
    //    createProjectile(600,600);
    //});

    DE.Inputs.on('keyDown', 'left', function () {
        Game.player.axes.x = -3;
    });

    DE.Inputs.on('keyDown', 'right', function () {
        Game.player.axes.x = 3;
    });
    DE.Inputs.on('keyUp', 'right', function () {
        Game.player.axes.x = 0;
    });
    DE.Inputs.on('keyUp', 'left', function () {
        Game.player.axes.x = 0;
    });
    DE.Inputs.on('keyUp', 'up', function () {
        Game.player.axes.y = 0;
        jump = false;
    });
    DE.Inputs.on('keyDown', 'up', function () {
        console.log(jump);
        if (jump == true) {
            Game.player.axes.y = -5;
            jump = false;
            setTimeout(() => { Game.player.axes.y = 0; }, 500);
        } else {
            Game.player.axes.y = 0;
        }

    });
}


function boxesIntersect(a, b) {
    var ab = a.getBounds();
    var bb = b.getBounds();

    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

function isOnGround() {
    plateforme.forEach(function (item, index, array) {
        boxesIntersect(Game.player.gameObjects[0], item);
    })
}

function createPiece(Vx, Vy) {
    var temp = new DE.GameObject({
        x: Vx,
        y: Vy,
        scale: 3,
        renderers: [
            new DE.SpriteRenderer({ spriteName: 'apple', loop: true, }),
        ],
        gameObjects: [
            new DE.GameObject({
                _staticPosition: true,
                x: -8,
                y: -8,
                renderer: new DE.RectRenderer(16, 16, '0x' + 'AFFCFC', {
                    alpha: 0,
                }),
            }),
        ]
    });
    Game.scene.add(temp);
    collectible.push(temp);
}

//function createProjectile(coord, direction) {
//    var Vx;
//    var Vy;
//    var dirY = 0;
//    var dirX = 0;
//    var preparation = false;
//    if (direction == "top") {
//        Vx = coord;
//        Vy = -400;
//        dirY = 1;
//    } else if (direction == "bottom") {
//        Vx = coord;
//        Vy = 1080 + 400;
//        dirY = -1;
//    } else if (direction == "left") {
//        Vx = 1920 + 400;
//        Vy = coord;
//        dirX = -1;
//    } else if (direction == "right") {
//        Vx = -400;
//        Vy = coord;
//        dirX = 1;
//    }
//    var temp = new DE.GameObject({
//        x: Vx,
//        y: Vy,
//        axes: { x: dirX, y: dirY },
//        renderers: [
//            new DE.SpriteRenderer({ spriteName: 'apple', loop: true, }),
//        ],
//        gameObjects: [
//            new DE.GameObject({
//                _staticPosition: true,
//                x: 0,
//                y: 0,
//                renderer: new DE.RectRenderer(400, 200, '0x' + 'AFFCFC', {
//                    //_staticPosition: true,
//                    //alpha: 0,
//                }),
//            })
//        ]
//    });
//    Game.scene.add(temp);
//    projectile.push(temp);
//    lancementProjectile(temp, temp.axes.x, temp.axes.y);
//}

//function lancementProjectile(proj, Vx, Vy) {
//    setTimeout(() => { while (proj.x < 2500 && proj.x > -500 && proj.y < 1580 && proj.y > -500) { proj.translate({ x: Vx, y: Vy }); console.log("deplacement proj : Vx = " + proj.x + " Vy = " + proj.y) } console.log("fin proj : Vx = " + Vx + " Vy = " + Vy) }, 500);
//}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function createProj(Vx) {
    Game.projectile;
    Game.projectile = new DE.GameObject({
        x: Vx,
        y: -200,
        scale : 8,
        lancer: true,
        aSupp: false,
        renderers: [
            new DE.SpriteRenderer({ spriteName: 'box' }),
        ],
        gameObjects: [
            new DE.GameObject({
                _staticPosition: true,
                x: -8,
                y: -8,
                renderer: new DE.RectRenderer(16, 16, '0x' + 'FDCCFC', {
                    //lineStyle: [4, '0xFF3300', 1],
                    //fill: true,
                    //x: 0,
                    //y: 0,
                    alpha: 0,
                }),
            }),
        ],
        axes: { x: 0, y: 0 },
        trans: function () {
            if (this.lancer == true) {
                this.translate({ x: this.axes.x, y: this.axes.y + 2 });
            }
            if (this.x > 2200 || this.x < -300 || this.y > 1400 || this.y < -400) {
                this.aSupp = true;
            }


        },
        automatisms: [['trans', 'trans']],
    });
    Game.scene.add(Game.projectile);
    projectileTab.push(Game.projectile);
}
function spawnPlayer() {

}


window.Game = Game;

export default Game;

