class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 900;   
        this.MAXSPEED = 100;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 10;
        this.SCALE = 2.0;
        this.note1collected = false;
        this.note2collected = false;
        this.note3collected = false;
    }


    preload(){
        // LOAD AUDIO FOR LEVEL
        this.load.audio("note1Sound", "assets/note1.mp3");
        this.load.audio("note2Sound", "assets/note2.mp3");
        this.load.audio("note3Sound", "assets/note3.mp3");
        this.load.audio("chordSound", "assets/chord.mp3");
        this.load.audio("background", "assets/background1.mp3");
        this.load.audio("walking", "assets/walking.mp3");
        this.load.audio("jump", "assets/jump.mp3");
    }


    create() {
        // LOAD AUDIO INTO SOUND MANAGER
        this.note1Sound = this.sound.add("note1Sound");
        this.note2Sound = this.sound.add("note2Sound");
        this.note3Sound = this.sound.add("note3Sound");
        this.chordSound = this.sound.add("chordSound");
        this.backgroundMusic = this.sound.add("background");
        this.walkingSound = this.sound.add("walking");
        this.jumpSound = this.sound.add("jump");
        this.backgroundMusic.play({
            loop: true,
            volume: 0.5
        });
        this.note1Sound.play({
            loop: true,
            volume: 0
        });
        this.note2Sound.play({
            loop: true,
            volume: 0
        });
        this.note3Sound.play({
            loop: true,
            volume: 0
        });


        // MAP SETUP
        // Create a new tilemap game object 
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 60, 30); 
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tileset2 = this.map.addTilesetImage("ethantiles", "tilemap_tiles_ethan");
        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", [this.tileset, this.tileset2], 0, 0);
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        //create spawn point
        let spawnX = 0;
        let spawnY = 0;
        this.groundLayer.forEachTile(tile => {
            if (tile.properties.spawn === true) {
                spawnX = tile.getCenterX();
                spawnY = tile.getCenterY();
            }
        });


        // Create note and finishline objects from Tiled Object Layer
        this.note1group = this.physics.add.staticGroup();
        this.map.getObjectLayer("Notes").objects.forEach(obj => {
            if (obj.name === "note1") {
                let note = this.note1group.create(639, 485, "tilemap_tiles_ethan", 0);
                note.refreshBody();
            }
        });
        this.note2group = this.physics.add.staticGroup();
        this.map.getObjectLayer("Notes").objects.forEach(obj => {
            if (obj.name === "note2") {
                let note = this.note2group.create(837, 305, "tilemap_tiles_ethan", 1);
                note.refreshBody();
            }
        });
        this.note3group = this.physics.add.staticGroup();
        this.map.getObjectLayer("Notes").objects.forEach(obj => {
            if (obj.name === "note3") {
                let note = this.note3group.create(1179, 415, "tilemap_tiles_ethan", 2);
                note.refreshBody();
            }
        });
        this.endgroup = this.physics.add.staticGroup();
        this.map.getObjectLayer("Notes").objects.forEach(obj=> {
            if (obj.name === "finish") {
                let finish = this.endgroup.create(1269, 384, "tilemap_sheet", 131);
                finish.refreshBody();
            }
        })


        // PLAYER SETUP
        my.sprite.player = this.physics.add.sprite(spawnX, spawnY, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);


/*         //water effects
        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.water == true;
        });

        my.vfx.bubbles = this.add.particles(0,0, "kenny-particles", {
            frame: ["circle_01.png", "circle_02.png"],
            randomFrame: true,
            scale: { start: 0.01, end: 0.03 },
            lifespan: 250,
            gravityY: -500,
            alpha: { start: 1, end: 0.1 },
            //quantity: 8,
            emitting: false
        }); */

        // VFX FOR NOTES
        my.vfx.note = this.add.particles(0,0, "kenny-particles", {
            frame: ["star_01.png", "star_02.png"],
            randomFrame: true,
            scale: { start: 0.03, end: 0.1 },
            lifespan: 350,
            gravityY: -400,
            alpha: { start: 1, end: 0.1 },
            //quantity: 8,
            emitting: false
        });

        // VFX FOR WALKING
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_01.png', 'dirt_02.png'],
            random: true,
            scale: {start: 0.01, end: 0.02},
            //maxAliveParticles: 8,
            lifespan: 250,
            gravityY: -100,
            alpha: {start: 1, end: 0.1}, 
        });

        // VFX FOR JUMPING
        my.vfx.jump = this.add.particles(0,0, "kenny-particles", {
            frame: "slash_04.png",
            lifespan: 500,
            scale: .08,
            alpha: { start: 1, end: 0 },
            gravityY: 200
        });


        // NOTE AND FINISH COLLISION HANDLERS:
        this.physics.add.overlap(my.sprite.player, this.note1group, (player, note) => {
            this.note1Sound.setVolume(.5);
            my.vfx.note.emitParticleAt(note.x, note.y);
            this.note1collected = true
            note.destroy();
        });

        this.physics.add.overlap(my.sprite.player, this.note2group, (player, note) => {
            this.note2Sound.setVolume(.5);
            my.vfx.note.emitParticleAt(note.x, note.y);
            this.note2collected = true;
            note.destroy();
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.note3group, (player, note) => {
            this.note3Sound.setVolume(.5);
            my.vfx.note.emitParticleAt(note.x, note.y);
            this.note3collected = true;
            note.destroy();
        }, null, this);

        this.physics.add.overlap(my.sprite.player, this.endgroup, (player, note) => {
            if (this.note1collected && this.note2collected && this.note3collected) {
                this.sound.stopAll();
                this.chordSound.play();
                this.walkingSound.stop();
                this.scene.start("creditsScene");
            }
        }, null, this);


        // INPUT SETUP 
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        
        // CAMERA
        this.cameras.main.setBackgroundColor('#87CEEB');
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels + 1000, this.map.heightInPixels + 1000);
        this.cameras.main.startFollow(my.sprite.player, true, 0.9, 0.9);
        this.cameras.main.setZoom(this.SCALE);
    }

    update() {
        // DEBUGGING HELP:
        //console.log('x: ' + my.sprite.player.x);
        //console.log('y: ' + my.sprite.player.y);

        // PLAYER MOVEMENT & INPUT
        if (cursors.left.isDown || cursors.right.isDown) {
            my.sprite.player.setAccelerationX(cursors.left.isDown ? -this.ACCELERATION : this.ACCELERATION);
            my.sprite.player.setFlip(cursors.right.isDown, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.walking.start();
            if (!this.walkingSound.isPlaying) {
                this.walkingSound.play({ loop: true, volume: 0.3, rate: 4 });
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            if (this.walkingSound.isPlaying) {
                this.walkingSound.stop();
            }
        }

        if (!my.sprite.player.body.blocked.down) {
            this.walkingSound.stop();
            my.vfx.walking.stop();
        }
        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play({volume:.1});
            my.vfx.jump.emitParticleAt(my.sprite.player.x,my.sprite.player.y +20);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

/*         this.waterTiles.forEach(tile => {
            let emit = Math.floor(Math.random() * 100) + 1;
            let x = tile.getCenterX();
            let minx = x-5;
            let maxx = x+5;
            let y = tile.getCenterY();
            let miny = y-5;
            let maxy = y+5
            let randomx = Math.floor(Math.random() * (maxx - minx + 1)) + minx;
            let randomy = Math.floor(Math.random() * (maxy - miny + 1)) + miny;
            if (emit == 2) my.vfx.bubbles.emitParticleAt(randomx,randomy);
        }); */
    }
}