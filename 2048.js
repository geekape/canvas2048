var c = document.getElementById('canvas');
var ctx = c.getContext("2d");
c.width = 550;
c.height = 550;


// 初始化
//地图
var map = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];
//不同数字的颜色信息
var num_color = { 0: "#ccc0b3", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563", 32: "#f67c5f", 64: "#ec6544", 128: "#e44d29", 256: "#edcf72", 512: "#c8a145", 1024: "#a8832b", 2048: "#86aa9c" };
//不同数字的大小信息
var num_size = { 0: "60", 2: "60", 4: "60", 8: "60", 16: "60", 32: "60", 64: "60", 128: "50", 256: "50", 512: "50", 1024: "40", 2048: "40" };
//不同数字的偏移量（为了将数字画在方块中心）
var offsetx = { 0: 65, 2: 65, 4: 65, 8: 65, 16: 45, 32: 45, 64: 45, 128: 40, 256: 40, 512: 40, 1024: 40, 2048: 40 };
//上下左右键的code对应的方向信息
var keycom = { '38': [0, -1], '40': [0, 1], '37': [-1, 0], '39': [1, 0] }
    //space表示当前剩余的空格块数，score表示当前的分数
var space = 16,
    score = 0,
    hostory = localStorage.history;


var draw = {
    loop: function(func) {
        for (var i = 0; i < 4; i++)
            for (var j = 0; j < 4; j++) {
                func(i, j);
            }
    },

    // 随机生成方块
    produce: function() {
        // 随机取当前剩余方块以内的数
        var cot = ~~(Math.random() * space);

        var k = 0;
        draw.loop(function(i, j) {
            if (map[i][j] == 0) {
                if (cot == k) {
                    map[i][j] = 2;
                    draw.block();
                }
                k += 1;
            }
        });
        space -= 1;
    },


    // 绘制地图,更新分数
    block: function() {
        draw.loop(function(i, j) {
            var num = map[i][j];
            color = num_color[num];
            draw.roundRect(j * 130 + 30, i * 130 + 30, color);
            if (num != 0) {
                ctx.font = "bold " + num_size[num] + "px Arial,Microsoft Yahei";
                ctx.fillStyle = (num <= 4) ? "#776e65" : "white";
                ctx.fillText(String(map[i][j]), j * 132 + offsetx[num], i * 132 + 80 + num_size[num] / 3);
            }
        });
        document.getElementById("score").innerText = "Score: " + String(score);

    },

    // 绘制圆角矩形
    roundRect: function(x, y, c) {
        var box_width = ctx.canvas.width * 0.8 * 0.25;
        var margin_width = ctx.canvas.width * 0.2 * 0.20;
        console.log(box_width, margin_width);
        ctx.beginPath();
        ctx.fillStyle = c;
        ctx.moveTo(x, y);
        ctx.arcTo(x + box_width, y, x + box_width, y + 1, margin_width * 0.7);
        ctx.arcTo(x + box_width, y + box_width, x + box_width - 1, y + box_width, margin_width * 0.7);
        ctx.arcTo(x, y + box_width, x, y + box_width - 1, margin_width * 0.7);
        ctx.arcTo(x, y, x + 1, y, margin_width * 0.7);
        ctx.fill();
    },

}


var game = {
    init: function() {
        draw.produce();
        draw.produce();
        if (localStorage.history) {
            document.getElementById("history").innerText = "History: " + String(localStorage.history);
        }
    },
    move: function(dir) {
        //用来调整不同方向的遍历方式
        // -1 0
        function modify(x, y) {
            tx = x, ty = y;
            if (dir[0] == 0) tx = [ty, ty = tx][0];
            if (dir[1] > 0) tx = 3 - tx;
            if (dir[0] > 0) ty = 3 - ty;
            return [tx, ty];
        }
        //根据移动的方向，将地图中对应行/列中的数字一个个压入栈中，如果第一次遇到栈顶数字和待入栈数字相等，则栈顶数字乘2，最后用栈中数字更新地图中的对应行/列
        for (var i = 0; i < 4; i++) {
            var tmp = Array();
            var isadd = false;
            for (var j = 0; j < 4; j++) {
                var ti = modify(i, j)[0],
                    tj = modify(i, j)[1];
                if (map[ti][tj] != 0) {
                    if (!isadd && map[ti][tj] == tmp[tmp.length - 1]) {
                        score += (tmp[tmp.length - 1] *= 2);
                        isadd = true;
                        space += 1;
                    } else {
                        tmp.push(map[ti][tj]);
                    }
                }
            }
            for (var j = 0; j < 4; j++) {
                var ti = modify(i, j)[0],
                    tj = modify(i, j)[1];
                map[ti][tj] = isNaN(tmp[j]) ? 0 : tmp[j];
            }
        }
        draw.produce();
        if (space == 0) {
            alert("game over");
            game.historyScore(score);
        }
        draw.block();

    },
    /*
     * 首盘history应为游戏结束的分数，并更新localStorage.history
     * 次盘对比localStorage.history和scores的分数
     */
    historyScore: function(scores) {
        if (!localStorage.history) {
            localStorage.history = scores;
        }
        if (scores > localStorage.history) {
            localStorage.history = scores;
        }

    },

}


// 事件监听
document.onkeydown = function(e) {
    dir = keycom[(e ? e : event).keyCode];
    game.move(dir);
    console.log(dir);
};

var sx, sy, dx, dy, ex, ey;
canvas.ontouchstart = function(event) {
    var touch = event.touches[0];
    sx = touch.clientX, sy = touch.clientY;
}
canvas.ontouchmove = function(event) {
    var touch = event.touches[0];
    ex = touch.clientX, ey = touch.clientY;
    dx = ex - sx, dy = ey - sy;
    //禁止默认的滑动事件
    event.preventDefault();
}
canvas.ontouchend = function(event) {
    //根据横纵坐标位移判断滑动方向
    if (dy < -50 && Math.abs(dy / dx) > 2) game.move([0, -1]);
    if (dy > 50 && Math.abs(dy / dx) > 2) game.move([0, 1]);
    if (dx < -50 && Math.abs(dx / dy) > 2) game.move([-1, 0]);
    if (dx > 50 && Math.abs(dx / dy) > 2) game.move([1, 0]);
}


game.init();


document.getElementById("btn").onclick = function() {
    ctx.clearRect(0, 0, c.width, c.height);
    space = 16;
    score = 0;
    map = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    document.getElementById("score").innerText = "Score: " + String(score);
    draw.block();
    game.init();


};