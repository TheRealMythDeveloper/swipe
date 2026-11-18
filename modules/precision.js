
const Precision = {
    container: null,
    onComplete: null,
    active: false,
    animation: null,
    targets: [],
    trails: [],
    cursorX: -100,
    cursorY: -100,
    lastTrail: 0,
    lastTime: 0,
    hits: 0,
    required: 4,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.hits = 0;
        this.required = 4;
        this.cursorX = -100;
        this.cursorY = -100;
        this.lastTrail = 0;
        this.lastTime = 0;
        this.targets = [];
        this.trails = [];

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:16px;left:0;width:100%;text-align:center;z-index:5;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">PRECISION</h2>
                    <p style="margin-top:8px">Hit either moving target!</p>
                    <p class="precision-score" style="font-size:20px;margin-top:10px">HITS: 0 / 4</p>
                </div>
                <div class="precision-field" style="position:absolute;inset:0;overflow:hidden"></div>
            </div>
        `;

        this.field = container.querySelector(".precision-field");
        this.scoreElement = container.querySelector(".precision-score");

        const width = this.field.clientWidth;
        const height = this.field.clientHeight;

        const colors = ["#ff405c", "#54d6e8"];

        for (let i = 0; i < 2; i++) {
            const target = document.createElement("div");

            target.style.cssText = `
                position:absolute;
                width:68px;
                height:68px;
                border-radius:50%;
                background:${colors[i]};
                border:5px solid white;
                box-sizing:border-box;
                transform:translate(-50%,-50%);
                cursor:pointer;
                z-index:3;
                touch-action:none;
            `;

            this.field.appendChild(target);

            this.targets.push({
                element: target,
                x: width * (i === 0 ? 0.3 : 0.7),
                y: height * (i === 0 ? 0.55 : 0.7),
                vx: (i === 0 ? 1 : -1) * (150 + difficulty * 20),
                vy: (i === 0 ? -1 : 1) * (110 + difficulty * 15),
                size: 68,
                color: colors[i],
                lastTrail: 0
            });

            target.addEventListener("pointerdown", event => {
                event.stopPropagation();
                this.hitTarget();
            });
        }

        this.handleMove = event => {
            const rect = this.field.getBoundingClientRect();

            this.cursorX = event.clientX - rect.left;
            this.cursorY = event.clientY - rect.top;

            const now = performance.now();

            if (now - this.lastTrail > 30) {
                this.lastTrail = now;
                this.createTrail(
                    this.cursorX,
                    this.cursorY,
                    "#ffffff",
                    9
                );
            }
        };

        this.field.addEventListener("pointermove", this.handleMove);

        this.animation = requestAnimationFrame(time => this.animate(time));
    },

    animate(time) {
        if (!this.active) return;

        if (!this.lastTime) this.lastTime = time;

        const delta = Math.min((time - this.lastTime) / 1000, 0.04);
        this.lastTime = time;

        const width = this.field.clientWidth;
        const height = this.field.clientHeight;

        this.targets.forEach(target => {
            target.x += target.vx * delta;
            target.y += target.vy * delta;

            if (target.x > width + 35) target.x = -35;
            if (target.x < -35) target.x = width + 35;

            if (target.y > height + 35) target.y = -35;
            if (target.y < -35) target.y = height + 35;

            target.element.style.left = `${target.x}px`;
            target.element.style.top = `${target.y}px`;

            const now = performance.now();

            if (now - target.lastTrail > 55) {
                target.lastTrail = now;

                this.createTrail(
                    target.x,
                    target.y,
                    target.color,
                    24
                );
            }
        });

        this.animation = requestAnimationFrame(nextTime => this.animate(nextTime));
    },

    createTrail(x, y, color, size) {
        const trail = document.createElement("div");

        trail.style.cssText = `
            position:absolute;
            left:${x}px;
            top:${y}px;
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            opacity:0.55;
            transform:translate(-50%,-50%);
            pointer-events:none;
            z-index:1;
        `;

        this.field.appendChild(trail);
        this.trails.push(trail);

        setTimeout(() => {
            trail.style.transition = "opacity 0.35s, transform 0.35s";
            trail.style.opacity = "0";
            trail.style.transform = "translate(-50%,-50%) scale(0.2)";
        }, 20);

        setTimeout(() => {
            trail.remove();
            this.trails = this.trails.filter(item => item !== trail);
        }, 400);
    },

    hitTarget() {
        if (!this.active) return;

        this.hits++;

        this.scoreElement.textContent =
            `HITS: ${this.hits} / ${this.required}`;

        if (this.hits >= this.required) {
            this.finish(true);
        }
    },

    finish(success) {
        if (!this.active) return;

        this.active = false;
        cancelAnimationFrame(this.animation);

        if (success) this.onComplete?.(true);
    },

    cleanup() {
        this.active = false;

        if (this.animation) {
            cancelAnimationFrame(this.animation);
        }

        if (this.field && this.handleMove) {
            this.field.removeEventListener("pointermove", this.handleMove);
        }

        this.targets = [];
        this.trails = [];
        this.container = null;
        this.field = null;
        this.scoreElement = null;
    }
};
