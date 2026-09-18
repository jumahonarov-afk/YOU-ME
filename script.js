const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

let particles = [];
let stars = [];
let petals = [];

let startTime = performance.now();

let heartProgress = 0;

let heartbeatX = -200;

let heartbeatStarted = false;
let heartStarted = false;

let lastPetal = 0;


/* =========================================
   RESIZE
========================================= */

function resize() {

    W = window.innerWidth;
    H = window.innerHeight;

    const ratio =
        Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * ratio;
    canvas.height = H * ratio;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    createStars();
}

window.addEventListener(
    "resize",
    resize
);


/* =========================================
   STARS
========================================= */

function createStars() {

    stars = [];

    const amount =
        Math.floor(
            (W * H) / 4500
        );

    for (let i = 0; i < amount; i++) {

        stars.push({

            x: Math.random() * W,

            y: Math.random() * H,

            radius:
                Math.random() * 0.9 +
                0.15,

            alpha:
                Math.random() * 0.65 +
                0.1,

            speed:
                Math.random() * 0.004 +
                0.001,

            phase:
                Math.random() *
                Math.PI *
                2
        });
    }
}


/* =========================================
   DRAW STARS
========================================= */

function drawStars(time) {

    for (const star of stars) {

        const twinkle =
            Math.sin(
                time * star.speed +
                star.phase
            );

        const alpha =
            star.alpha +
            twinkle * 0.18;

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255,255,255,${Math.max(0.03, alpha)})`;

        ctx.fill();
    }
}


/* =========================================
   HEART FORMULA
========================================= */

function heart(t, scale) {

    const x =
        16 *
        Math.pow(
            Math.sin(t),
            3
        );

    const y =
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    return {
        x: x * scale,
        y: -y * scale
    };
}


/* =========================================
   HEART PARTICLES
========================================= */

function createHeartParticles() {

    particles = [];

    const cx = W / 2;
    const cy = H / 2;

    const scale =
        Math.min(W, H) * 0.0155;

    const count = 1200;

    for (let i = 0; i < count; i++) {

        const t =
            Math.random() *
            Math.PI *
            2;

        const p =
            heart(
                t,
                scale
            );

        /*
            Particle initially starts
            outside the heart.
        */

        const randomAngle =
            Math.random() *
            Math.PI *
            2;

        const randomDistance =
            Math.random() *
            Math.min(W, H) *
            0.45;

        const startX =
            cx +
            Math.cos(randomAngle) *
            randomDistance;

        const startY =
            cy +
            Math.sin(randomAngle) *
            randomDistance;

        particles.push({

            t: t,

            startX: startX,

            startY: startY,

            x: startX,

            y: startY,

            targetX:
                cx + p.x,

            targetY:
                cy + p.y,

            size:
                Math.random() *
                1.25 +
                0.25,

            alpha:
                Math.random() *
                0.65 +
                0.25,

            phase:
                Math.random() *
                Math.PI *
                2,

            speed:
                Math.random() *
                0.4 +
                0.7,

            offset:
                Math.random() * 0.3
        });
    }

    heartStarted = true;
}


/* =========================================
   UPDATE HEART
========================================= */

function updateHeart(progress, time) {

    if (!heartStarted) {
        return;
    }

    const cx = W / 2;
    const cy = H / 2;

    const scale =
        Math.min(W, H) * 0.0155;

    /*
        Ease-out
    */

    const eased =
        1 -
        Math.pow(
            1 - progress,
            3
        );

    for (const p of particles) {

        let local =
            eased -
            p.offset;

        local =
            Math.max(
                0,
                Math.min(1, local * 1.35)
            );

        const move =
            1 -
            Math.pow(
                1 - local,
                4
            );

        p.x =
            p.startX +
            (p.targetX - p.startX) *
            move;

        p.y =
            p.startY +
            (p.targetY - p.startY) *
            move;

        /*
            Tiny living movement after
            heart has been created.
        */

        if (progress > 0.96) {

            const wave =
                Math.sin(
                    time * 0.003 +
                    p.phase
                );

            p.x += wave * 0.8;

            p.y +=
                Math.cos(
                    time * 0.0025 +
                    p.phase
                ) * 0.7;
        }
    }
}


/* =========================================
   DRAW HEART PARTICLES
========================================= */

function drawHeartParticles(time) {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    for (const p of particles) {

        const pulse =
            0.7 +
            Math.sin(
                time * 0.004 +
                p.phase
            ) * 0.3;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255,${55 + Math.random() * 45},${100 + Math.random() * 70},${p.alpha * pulse})`;

        ctx.shadowBlur = 8;

        ctx.shadowColor =
            "rgba(255,35,100,0.8)";

        ctx.fill();
    }

    ctx.restore();

    ctx.shadowBlur = 0;
}


/* =========================================
   HEART OUTER GLOW
========================================= */

function drawHeartGlow(time) {

    if (!heartStarted) {
        return;
    }

    const cx = W / 2;
    const cy = H / 2;

    const scale =
        Math.min(W, H) * 0.0155;

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    for (let layer = 0; layer < 4; layer++) {

        ctx.beginPath();

        for (
            let t = 0;
            t <= Math.PI * 2;
            t += 0.012
        ) {

            const p =
                heart(
                    t,
                    scale
                );

            const wave =
                Math.sin(
                    time * 0.002 +
                    t * 7
                ) *
                (layer + 1) *
                0.18;

            const x =
                cx +
                p.x +
                wave;

            const y =
                cy +
                p.y +
                wave;

            if (t === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }

        ctx.closePath();

        ctx.lineWidth =
            0.35 +
            layer * 0.35;

        ctx.strokeStyle =
            `rgba(255,45,105,${0.13 - layer * 0.022})`;

        ctx.shadowBlur =
            10 +
            layer * 8;

        ctx.shadowColor =
            "rgba(255,30,90,0.7)";

        ctx.stroke();
    }

    ctx.restore();

    ctx.shadowBlur = 0;
}


/* =========================================
   HEARTBEAT / ECG LINE
========================================= */

function drawHeartbeat(time) {

    if (!heartbeatStarted) {
        return;
    }

    const centerY =
        H / 2;

    /*
        Heartbeat travels from left
        toward the center.
    */

    heartbeatX += 5.5;

    const points = [];

    const start =
        heartbeatX - 260;

    const end =
        heartbeatX;

    for (
        let x = start;
        x < end;
        x += 2
    ) {

        let y =
            centerY;

        const local =
            x - start;

        /*
            normal line
        */

        if (
            local > 65 &&
            local < 105
        ) {

            const p =
                (local - 65) / 40;

            y =
                centerY -
                Math.sin(p * Math.PI) *
                9;

        }

        /*
            BIG ECG SPIKE
        */

        if (
            local >= 105 &&
            local < 125
        ) {

            const p =
                (local - 105) / 20;

            y =
                centerY -
                Math.sin(p * Math.PI) *
                45;
        }

        if (
            local >= 125 &&
            local < 145
        ) {

            const p =
                (local - 125) / 20;

            y =
                centerY +
                Math.sin(p * Math.PI) *
                30;
        }

        /*
            return
        */

        if (
            local >= 145 &&
            local < 175
        ) {

            const p =
                (local - 145) / 30;

            y =
                centerY -
                Math.sin(p * Math.PI) *
                12;
        }

        points.push({
            x: x,
            y: y
        });
    }


    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {

        const p = points[i];

        if (i === 0) {

            ctx.moveTo(
                p.x,
                p.y
            );

        } else {

            ctx.lineTo(
                p.x,
                p.y
            );
        }
    }

    ctx.lineWidth = 1.3;

    ctx.strokeStyle =
        "rgba(255,55,115,0.95)";

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "rgba(255,25,90,0.95)";

    ctx.stroke();

    /*
        glowing head
    */

    ctx.beginPath();

    ctx.arc(
        end,
        points[points.length - 1].y,
        2.5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,180,200,1)";

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        "rgba(255,40,100,1)";

    ctx.fill();

    ctx.restore();

    ctx.shadowBlur = 0;
}


/* =========================================
   PETALS
========================================= */

function createPetal() {

    petals.push({

        x:
            Math.random() * W,

        y:
            -30,

        size:
            Math.random() * 6 +
            3,

        speed:
            Math.random() * 1.1 +
            0.45,

        rotation:
            Math.random() *
            Math.PI *
            2,

        rotationSpeed:
            (Math.random() - 0.5) *
            0.045,

        sway:
            Math.random() * 1.4 +
            0.3,

        phase:
            Math.random() *
            Math.PI *
            2,

        alpha:
            Math.random() * 0.45 +
            0.35
    });
}


/* =========================================
   UPDATE PETALS
========================================= */

function updatePetals(time) {

    if (
        time - lastPetal >
        180
    ) {

        lastPetal = time;

        createPetal();

        if (Math.random() < 0.5) {
            createPetal();
        }
    }

    for (
        let i = petals.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            petals[i];

        p.y += p.speed;

        p.x +=
            Math.sin(
                time * 0.001 +
                p.phase
            ) *
            p.sway;

        p.rotation +=
            p.rotationSpeed;

        if (
            p.y >
            H + 40
        ) {

            petals.splice(
                i,
                1
            );
        }
    }
}


/* =========================================
   DRAW PETALS
========================================= */

function drawPetals() {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    for (const p of petals) {

        ctx.save();

        ctx.translate(
            p.x,
            p.y
        );

        ctx.rotate(
            p.rotation
        );

        ctx.globalAlpha =
            p.alpha;

        ctx.beginPath();

        ctx.moveTo(
            0,
            -p.size
        );

        ctx.bezierCurveTo(
            p.size * 0.9,
            -p.size * 0.3,

            p.size * 0.85,
            p.size * 0.7,

            0,
            p.size
        );

        ctx.bezierCurveTo(
            -p.size * 0.85,
            p.size * 0.7,

            -p.size * 0.9,
            -p.size * 0.3,

            0,
            -p.size
        );

        ctx.closePath();

        ctx.fillStyle =
            "rgba(255,35,105,0.85)";

        ctx.shadowBlur = 10;

        ctx.shadowColor =
            "rgba(255,20,90,0.9)";

        ctx.fill();

        ctx.restore();
    }

    ctx.restore();

    ctx.shadowBlur = 0;
}


/* =========================================
   SMALL PARTICLE EXPLOSIONS
========================================= */

let explosions = [];


function createExplosion(
    x,
    y
) {

    for (let i = 0; i < 90; i++) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            Math.random() *
            2.8 +
            0.5;

        explosions.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            size:
                Math.random() *
                1.5 +
                0.4,

            life: 1
        });
    }
}


function updateExplosions() {

    for (
        let i = explosions.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            explosions[i];

        p.x += p.vx;

        p.y += p.vy;

        p.vx *= 0.97;

        p.vy *= 0.97;

        p.life -= 0.018;

        if (
            p.life <= 0
        ) {

            explosions.splice(
                i,
                1
            );
        }
    }
}


function drawExplosions() {

    ctx.save();

    ctx.globalCompositeOperation =
        "lighter";

    for (const p of explosions) {

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255,55,115,${p.life})`;

        ctx.shadowBlur = 10;

        ctx.shadowColor =
            "rgba(255,30,100,0.9)";

        ctx.fill();
    }

    ctx.restore();
}


/* =========================================
   BACKGROUND
========================================= */

function drawBackground() {

    ctx.fillStyle =
        "rgba(0,0,0,0.22)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );
}


/* =========================================
   MAIN ANIMATION
========================================= */

function animate(now) {

    const elapsed =
        now - startTime;

    /*
        Background
    */

    drawBackground();

    /*
        Stars
    */

    drawStars(elapsed);


    /*
        0 - 1.8 sec
        ECG
    */

    if (
        elapsed > 500 &&
        !heartbeatStarted
    ) {

        heartbeatStarted = true;

        heartbeatX = -260;
    }


    if (
        heartbeatStarted &&
        elapsed < 3300
    ) {

        drawHeartbeat(
            elapsed
        );
    }


    /*
        1.8 sec
        Heart particles begin
    */

    if (
        elapsed > 1700 &&
        !heartStarted
    ) {

        createHeartParticles();

        createExplosion(
            W / 2,
            H / 2
        );
    }


    /*
        Heart construction
    */

    if (heartStarted) {

        heartProgress =
            Math.min(
                1,
                (elapsed - 1700) /
                2300
            );

        updateHeart(
            heartProgress,
            elapsed
        );

        drawHeartGlow(
            elapsed
        );

        drawHeartParticles(
            elapsed
        );
    }


    /*
        Explosions
    */

    updateExplosions();

    drawExplosions();


    /*
        Petals
    */

    if (elapsed > 3000) {

        updatePetals(
            elapsed
        );

        drawPetals();
    }


    requestAnimationFrame(
        animate
    );
}


/* =========================================
   START
========================================= */

resize();

ctx.fillStyle = "#000";

ctx.fillRect(
    0,
    0,
    W,
    H
);

requestAnimationFrame(
    animate
);