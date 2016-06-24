

    //-------------------------------------------------------------------------
    // POLYFILLS
    //-------------------------------------------------------------------------

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    }



    //-------------------------------------------------------------------------
    // UTILITIES
    //-------------------------------------------------------------------------

    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();

    }

    function bound(x, min, max) {
        return Math.max(min, Math.min(max, x));
    }

    function get(url, onsuccess) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if ((request.readyState == 4) && (request.status == 200))
                onsuccess(request);
        }
        request.open("GET", url, true);
        request.send();
    }

    function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(((x1 + w1 - 1) < x2) ||
                ((x2 + w2 - 1) < x1) ||
                ((y1 + h1 - 1) < y2) ||
                ((y2 + h2 - 1) < y1))
    }
    //-------------------------------------------------------------------------
    // GAME CONSTANTS AND VARIABLES
    //-------------------------------------------------------------------------


    var MAP = {tw: 0, th: 0},
    score = 0,
            TILE = 32,
            METER = TILE, //amount for gravity for example
            GRAVITY = 9.81 * 6, // default (exagerated) gravity
            MAXDX = 15, // default max horizontal speed (15 tiles per second)
            MAXDY = 72, // default max vertical speed   (72 tiles per second)
            ACCEL = 1 / 2, // default take 1/2 second to reach maxdx (horizontal acceleration)
            FRICTION = 1 / 6, // default take 1/6 second to stop from maxdx (horizontal friction)
            IMPULSE = 1500; // default player jump impulse

    var fps = 60,
            step = 1 / fps,
            canvas = document.getElementById('world'),
            ctx = canvas.getContext('2d'),
            width = canvas.width = 800, //MAP.tw * TILE
            height = canvas.height = 600, //MAP.th * TILE
            player = {},
            monsters = [],
            treasure = [],
            cells = [];

    var offsetX = canvas.width / 2 - TILE / 2,
            offsetY = canvas.height / 2 - TILE / 2; //default value
    /* disable context menu */
    canvas.oncontextmenu = function () {
        return false;
    };

    images = {
        'lion': 'mobs/Lion/Lion_1.png',
        'duck': {
            'right': 'mobs/Duck/Duck_1.png',
            'left': 'mobs/Duck/Duck_1_flip.png',
            'fallingRight': 'mobs/Duck/Duck_9.png',
            'fallingLeft': 'mobs/Duck/Duck_9_flip.png'
        },
        'flip': {
            'lion': 'mobs/Lion/Lion_1_flip.png',
            'duck': 'mobs/Duck/Duck_1_flip.png'
        }
    };

    COLOR = {BLACK: '#111',
        YELLOW: '#ECD078',
        BRICK: '#D95B43',
        PINK: '#C02942',
        PURPLE: '#542437',
        GREY: '#333',
        LION: '#778899',
        GOLD: 'gold'},
            
    COLORS = [COLOR.YELLOW, COLOR.BRICK, COLOR.PINK, COLOR.PURPLE, COLOR.GREY],
            KEY = {SPACE: 32, LEFT: 65, UP: 87, RIGHT: 68, DOWN: 83};

    var t2p = function (t) {
        return t * TILE;
    },
            p2t = function (p) {
                return Math.floor(p / TILE);
            },
            cell = function (x, y) {
                return tcell(p2t(x), p2t(y));
            },
            tcell = function (tx, ty) {
                return cells[tx + (ty * MAP.tw)];
            };


    //-------------------------------------------------------------------------
    // UPDATE LOOP
    //-------------------------------------------------------------------------

    function onkey(ev, key, down) {
        switch (key) {
            case KEY.LEFT:
                player.left = down;
                ev.preventDefault();
                return false;
            case KEY.RIGHT:
                player.right = down;
                ev.preventDefault();
                return false;
            case KEY.UP:
                player.jump = down;
                ev.preventDefault();
                return false;
        
        }
    }

    function update(dt) {
        updatePlayer(dt);
        updateMonsters(dt);
        checkTreasure();

    }
    function updatePlayer(dt) {
        updateEntity(player, dt);

        /* stay in playground */
        if (player.y > t2p(MAP.th) || player.y < 0 || player.x > t2p(MAP.tw) || player.x < 0)
            kill(player);

    }
    function updateMonsters(dt) {
        var n, max;
        for (n = 0, max = monsters.length; n < max; n++)
            updateMonster(monsters[n], dt);
    }


    function updateMonster(monster, dt) {
        if (!monster.dead) {
            updateEntity(monster, dt);
            if (overlap(player.x, player.y, TILE, TILE, monster.x, monster.y, TILE, TILE)) {
                kill(player);
            }
        }
    }

    function checkTreasure() {

        var n, max, t;
        for (n = 0, max = treasure.length; n < max; n++) {
            t = treasure[n];
            if (!t.collected && overlap(player.x, player.y, TILE, TILE, t.x, t.y, TILE, TILE)) {
                collectTreasure(t);
                playSound("collect");
            }
        }

    }


    function kill(unit) {

        if (unit.player) {

            playSound("death");
            setCookie("death", getCookie("death") * 1 + 1, 31);
            document.title = "You died: " + getCookie("death") + " times";

            /* relocate player */
            player.x = player.start.x;
            player.y = player.start.y;

            player.dx = player.dy = 0;

        }
        unit.dead = true;
    }
    function collectTreasure(t) {
        player.collected++;

        /* checkpoints :D */
        player.start.x = player.x;
        player.start.y = player.y;

        if (player.collected >= treasure.length) {
            /* finish the game // done // victory // swag */

            setCookie("level", getCookie("level") * 1 + 1, 30);
            newLevel("level" + getCookie("level"));

            if (getCookie("death") <= 10)
                playSound('victory');    //no death victory earn a prize maybe?
            if (getCookie("level") >= 4) {
                alert("Nice!, you got trough. As a true duckling you have died only a mere " + getCookie("death") + " times");
                if (confirm("Want to play in lvl 1 again?")) {
                    setCookie("level", 0, 31);
                    newLevel("level" + getCookie("level"));
                }
            }
        }
        t.collected = true;
    }

    function updateEntity(entity, dt) {

        var wasleft = entity.dx < 0,
                wasright = entity.dx > 0,
                falling = entity.falling,
                friction = entity.friction * (falling ? 0.5 : 1),
                accel = entity.accel * (falling ? 0.5 : 1);

        entity.ddx = 0;
        entity.ddy = entity.gravity;


        if (entity.left) {
            entity.ddx = entity.ddx - accel;
            entity.facing = "left";
        }
        else if (wasleft)
            entity.ddx = entity.ddx + friction;

        if (entity.right) {
            entity.ddx = entity.ddx + accel;
            entity.facing = "right";
        }
        else if (wasright)
            entity.ddx = entity.ddx - friction;

        if (entity.jump && !entity.jumping && !falling) {
            entity.ddy = entity.ddy - entity.impulse; // an instant big force impulse
            entity.jumping = true;
        }

        entity.x = entity.x + (dt * entity.dx);
        entity.y = entity.y + (dt * entity.dy);
        entity.dx = bound(entity.dx + (dt * entity.ddx), -entity.maxdx, entity.maxdx);
        entity.dy = bound(entity.dy + (dt * entity.ddy), -entity.maxdy, entity.maxdy);

        if ((wasleft && (entity.dx > 0)) ||
                (wasright && (entity.dx < 0))) {
            entity.dx = 0; // clamp at zero for !walking around
        }

        var tx = p2t(entity.x),
                ty = p2t(entity.y),
                nx = entity.x % TILE,
                ny = entity.y % TILE,
                cell = tcell(tx, ty),
                cellright = tcell(tx + 1, ty),
                celldown = tcell(tx, ty + 1),
                celldiagdown = tcell(tx + 1, ty + 1);

        //normal gravity
        if (entity.dy > 0) {
            if ((celldown && !cell) ||
                    (celldiagdown && !cellright && nx)) {
                entity.y = t2p(ty);
                entity.dy = 0;
                entity.falling = false;
                entity.jumping = false;
                ny = 0;
            }
        }

        else if (entity.dy < 0) {
            if ((cell && !celldown) ||
                    (cellright && !celldiagdown && nx)) {
                entity.y = t2p(ty + 1);
                entity.dy = 0;
                cell = celldown;
                cellright = celldiagdown;
                ny = 0;
            }
        }

        if (entity.dx > 0) {
            if ((cellright && !cell) ||
                    (celldiagdown && !celldown && ny)) {
                entity.x = t2p(tx);
                entity.dx = 0;
            }
        }
        else if (entity.dx < 0) {
            if ((cell && !cellright) ||
                    (celldown && !celldiagdown && ny)) {
                entity.x = t2p(tx + 1);
                entity.dx = 0;
            }
        }

        if (entity.monster) {
            if (entity.left && (cell || !celldown)) {
                entity.left = false;
                entity.right = true;
            }
            else if (entity.right && (cellright || !celldiagdown)) {
                entity.right = false;
                entity.left = true;
            }
        }

        entity.falling = !(celldown || (nx && celldiagdown));
    }
    //-------------------------------------------------------------------------
    // RENDERING
    //-------------------------------------------------------------------------


    function render(ctx, frame, dt) {
        ctx.save();
        
        offsetX = player.x;             //default follow camera X
        offsetY = player.y - TILE / 2;  //default follow camera Y
        
        if (player.x < canvas.width / 2 - TILE / 2)
            offsetX = canvas.width / 2 - TILE / 2;  //left side X

        else if (player.x > t2p(MAP.tw) - canvas.width / 2 - TILE)
            offsetX = t2p(MAP.tw) - canvas.width / 2 - TILE; //right side X

        if (player.y < canvas.height / 2 - TILE / 2)
            offsetY = canvas.height / 2 - TILE / 2;  //upper side Y
        
        else if (player.y > t2p(MAP.th) - canvas.height /2)
            offsetY = t2p(MAP.th) - canvas.height /2 - TILE /2; //down side Y
        
        ctx.translate(-offsetX + 384, -offsetY + 284);    //32/2 == 16 384 == canvas.width/2-(player.width/2)
        ctx.clearRect(0, 0, offsetX + canvas.width, offsetY + canvas.height);


        renderMap(ctx);
        renderPlayer(ctx, dt);
        renderTreasure(ctx, frame);
        renderBlinkingTreasure(ctx, dt);
        renderMonsters(ctx, dt);

        ctx.restore();
    }


    function renderMap(ctx) {

        var x, y, cell;
        for (y = 0; y < MAP.th; y++) {
            for (x = 0; x < MAP.tw; x++) {
                cell = tcell(x, y);
                if (cell) {
                    ctx.fillStyle = COLORS[cell - 1];
                    ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
                }
            }
        }

    }

    function renderPlayer(ctx, dt) {
        image = new Image();

        if (player.facing == "left") {
            //going left

            image.src = (player.falling) ? images.duck.fallingLeft : images.duck.left;
            ctx.drawImage(image, player.x + (player.dx * dt), player.y + (player.dy * dt), TILE, TILE);

        } else {
            //going right
            image.src = (player.falling) ? images.duck.fallingRight : images.duck.right;
            ctx.drawImage(image, player.x + (player.dx * dt), player.y + (player.dy * dt), TILE, TILE);

        }

    }
    function renderMonsters(ctx, dt) {
        image = new Image();

        var n, max, monster;
        for (n = 0, max = monsters.length; n < max; n++) {
            monster = monsters[n];

            if (!monster.dead) {
                if (monster.facing == "left") {
                    //going left
                    image.src = images.flip.lion;
                    ctx.drawImage(image, monster.x + (monster.dx * dt), monster.y + (monster.dy * dt), TILE, TILE);
                } else {
                    //going right
                    image.src = images.lion;
                    ctx.drawImage(image, monster.x + (monster.dx * dt), monster.y + (monster.dy * dt), TILE, TILE);
                }
            }
        }
    }
    function renderBlinkingTreasure(ctx, frame) {
        ctx.fillStyle = COLOR.GOLD;
        ctx.globalAlpha = 0.25 + tweenTreasure(frame, 60);
        var n, max, t;
        for (n = 0, max = treasure.length; n < max; n++) {
            t = treasure[n];
            if (!t.collected)
                ctx.fillRect(t.x, t.y + TILE / 3, TILE, TILE * 2 / 3);
        }
        ctx.globalAlpha = 1;
    }

    function renderTreasure(ctx, frame) {
        ctx.fillStyle = COLOR.GOLD;
        ctx.globalAlpha = 0.25 + tweenTreasure(frame, 60);
        var n, max, t;
        for (n = 0, max = treasure.length; n < max; n++) {
            t = treasure[n];
            if (!t.collected)
                ctx.fillRect(t.x, t.y + TILE / 3, TILE, TILE * 2 / 3);
        }
        ctx.globalAlpha = 1;
    }

    function tweenTreasure(frame, duration) {
        var half = duration / 2,
                pulse = frame % duration;
        return pulse < half ? (pulse / half) : 1 - (pulse - half) / half;
    }

    //-------------------------------------------------------------------------
    // LOAD THE MAP
    //-------------------------------------------------------------------------

    function setup(map) {

        var data = map.layers[0].data,
                objects = map.layers[1].objects,
                n, obj, entity;

        MAP.tw = map.width;
        MAP.th = map.height;

        for (n = 0; n < objects.length; n++) {
            obj = objects[n];
            entity = setupEntity(obj);
            switch (obj.type) {
                case "player"   :
                    player = entity;
                    break;
                case "monster"  :
                    monsters.push(entity);
                    break;
                case "treasure" :
                    treasure.push(entity);
                    break;
            }
        }

        cells = data;
    }

    function setupEntity(obj) {
        var entity = {};
        entity.x = obj.x;
        entity.y = obj.y;
        entity.dx = 0;
        entity.dy = 0;
        entity.gravity = METER * (obj.properties.gravity || GRAVITY);
        entity.maxdx = METER * (obj.properties.maxdx || MAXDX);
        entity.maxdy = METER * (obj.properties.maxdy || MAXDY);
        entity.impulse = METER * (obj.properties.impulse || IMPULSE);
        entity.accel = entity.maxdx / (obj.properties.accel || ACCEL);
        entity.friction = entity.maxdx / (obj.properties.friction || FRICTION);
        entity.monster = obj.type == "monster";
        entity.player = obj.type == "player";
        entity.treasure = obj.type == "treasure";
        entity.left = obj.properties.left;
        entity.right = obj.properties.right;
        entity.start = {x: obj.x, y: obj.y}
        entity.killed = entity.collected = 0;
        return entity;
    }

    //-------------------------------------------------------------------------
    // THE GAME LOOP
    //-------------------------------------------------------------------------

    var counter = 0, dt = 0, now,
            last = timestamp();

    function frame() {
        now = timestamp();
        dt = dt + Math.min(1, (now - last) / 1000);
        while (dt > step) {
            dt = dt - step;
            update(step);
        }
        render(ctx, counter, dt);
        last = now;
        counter++;
        requestAnimationFrame(frame, canvas);
    }
    document.addEventListener('keydown', function (ev) {
        return onkey(ev, ev.keyCode, true);
    }, false);
    document.addEventListener('keyup', function (ev) {
        return onkey(ev, ev.keyCode, false);
    }, false);

    function parseMap(mapFileName) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        get("levels/" + mapFileName + ".json", function (req) {
            setup(JSON.parse(req.responseText));

            //create new map with the new json
            frame();
        });
    }
    //==========================================================================
    //  GO TO LEVEL
    //==========================================================================
    function newLevel(levelname) {

        monsters.length = 0,
                treasure.length = 0,
                cells.length = 0;

        parseMap(levelname);
    }

    function newColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    //==========================================================================
    // AUDIO
    //==========================================================================
    function playSound(sound) {
        var aud = new Audio("audio/" + sound + ".mp3");
        aud.play();
    }

    //==========================================================================
    //  COOKIES!
    //==========================================================================
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return "";
    }
    function checkCookie(cname) {
        cname = getCookie(cname);
        return (cname != "" && cname != null) ? true : false;

    }
    function deleteCookie(name, path, domain) {
        if (getCookie(name)) {
            document.cookie = name + "=" +
                    ((path) ? ";path=" + path : "") +
                    ((domain) ? ";domain=" + domain : "") +
                    ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
    }
    if (!checkCookie("death"))
        setCookie("death", 0, 31);
    if (!checkCookie("level"))
        setCookie("level", 0, 31);
    if (getCookie("level") >= 4) {
        alert("Sorry i did not have the time to create more levels and content");
        if (confirm("Want to play in lvl 1 again?")) {
            setCookie("level", 0, 31);
            newLevel("level0");
        }
    }

    newLevel("level" + getCookie("level"));
