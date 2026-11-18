const Catch = {
    container: null,
    field: null,
    onComplete: null,
    active: false,
    animation: null,
    objects: [],
    catcher: null,
    score: null,
    message: null,
    hits: 0,
    required: 6,
    catcherX: 0,
    catcherY: 0,
    lastTime: 0,
    lastSpawn: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.objects = [];
        this.hits = 0;
        this.required = 6;
        this.lastTime = 0;
        this.lastSpawn = 0;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:14px;width:100%;text-align:center;z-index:5;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">CATCH</h2>
                    <p>Move your catcher beneath the falling objects</p>
                    <p class="catch-score" style="margin-top:8px">CAUGHT: 0 / 6</p>
                    <p class="catch-message" style="margin-top:5px">WATCH THE SKY</p>
                </div>
                <div class="catch-field" style="position:absolute;inset:0;overflow:hidden;touch-action:none">
                    <div class="catcher" style="position:absolute;left:50%;bottom:8%;width:120px;height:25px;border:4px solid white;border-radius:8px 8px 18px 18px;background:#54d6e8;transform:translateX(-50%);box-sizing:border-box;z-index:4"></div>
                </div>
            </div>
        `;

        this.field = container.querySelector(".catch-field");
        this.catcher = container.querySelector(".catcher");
        this.score = container.querySelector(".catch-score");
        this.message = container.querySelector(".catch-message");

        this.catcherX = this.field.clientWidth / 2;
        this.catcherY = this.field.clientHeight * 0.88;

        this.handleMove = event => {
            if (!this.active) return;

            const rect = this.field.getBoundingClientRect();

            this.catcherX = Math.max(
                65,
                Math.min(rect.width - 65, event.clientX - rect.left)
            );

            this.catcher.style.left = `${this.catcherX}px`;

            this.makeTrail(
                this.catcherX,
                this.catcherY,
                "#54d6e8",
                13
            );
        };

        this.field.addEventListener("pointerdown", this.handleMove);
        this.field.addEventListener("pointermove", this.handleMove);

        this.animation = requestAnimationFrame(time => this.animate(time));
    },

    animate(time) {
        if (!this.active) return;

        if (!this.lastTime) {
            this.lastTime = time;
            this.lastSpawn = time;
        }

        const delta = Math.min((time - this.lastTime) / 1000, 0.04);
        this.lastTime = time;

        if (time - this.lastSpawn > 600) {
            this.spawn();
            this.lastSpawn = time;
        }

        const height = this.field.clientHeight;
        const width = this.field.clientWidth;

        const catcherLeft = this.catcherX - 60;
        const catcherRight = this.catcherX + 60;
        const catcherTop = height * 0.88 - 18;

        this.objects.forEach(object => {
            object.x += object.vx * delta;
            object.y += object.vy * delta;

            object.element.style.left = `${object.x}px`;
            object.element.style.top = `${object.y}px`;

            if (time - object.lastTrail > 60) {
                object.lastTrail = time;

                this.makeTrail(
                    object.x,
                    object.y,
                    object.color,
                    17
                );
            }

            const caught =
                object.y + object.size / 2 >= catcherTop &&
                object.y - object.size / 2 <= catcherTop + 30 &&
                object.x >= catcherLeft - object.size / 2 &&
                object.x <= catcherRight + object.size / 2;

            if (caught && !object.caught) {
                object.caught = true;
                object.element.remove();
                this.hits++;

                this.score.textContent =
                    `CAUGHT: ${this.hits} / ${this.required}`;

                this.message.textContent = "NICE CATCH!";

                if (this.hits >= this.required) {
                    this.finish(true);
                }
            }
        });

        this.objects = this.objects.filter(object => {
            if (object.caught || object.y > height + 70 ||
                object.x < -70 || object.x > width + 70) {
                object.element.remove();
                return false;
            }

            return true;
        });

        if (this.active) {
            this.animation = requestAnimationFrame(next => this.animate(next));
        }
    },

    spawn() {
        const width = this.field.clientWidth;
        const size = 30 + Math.random() * 16;
        const colors = ["#ffb454", "#54d6e8", "#bd85ff", "#35c978"];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const element = document.createElement("div");

        element.style.cssText = `
            position:absolute;left:0;top:0;
            width:${size}px;height:${size}px;
            border-radius:${Math.random() > 0.5 ? "50%" : "7px"};
            background:${color};
            border:3px solid white;
            box-sizing:border-box;
            transform:translate(-50%,-50%);
            pointer-events:none;
            z-index:2;
        `;

        const x = 25 + Math.random() * (width - 50);
        const y = -size;

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        this.field.appendChild(element);

        this.objects.push({
            element,
            x,
            y,
            size,
            color,
            vx: (Math.random() - 0.5) * 170,
            vy: 190 + Math.random() * 100,
            caught: false,
            lastTrail: 0
        });
    },

    makeTrail(x, y, color, size) {
        const trail = document.createElement("div");

        trail.style.cssText = `
            position:absolute;left:${x}px;top:${y}px;
            width:${size}px;height:${size}px;
            border-radius:50%;background:${color};
            opacity:.4;transform:translate(-50%,-50%);
            pointer-events:none;z-index:1;
        `;

        this.field.appendChild(trail);

        setTimeout(() => {
            trail.style.transition = "opacity .3s, transform .3s";
            trail.style.opacity = "0";
            trail.style.transform = "translate(-50%,-50%) scale(.2)";
        }, 10);

        setTimeout(() => trail.remove(), 350);
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animation);
        this.onComplete?.(success);
    },

    cleanup() {
        this.active = false;

        if (this.animation) cancelAnimationFrame(this.animation);

        if (this.field && this.handleMove) {
            this.field.removeEventListener("pointerdown", this.handleMove);
            this.field.removeEventListener("pointermove", this.handleMove);
        }

        this.objects.forEach(object => object.element.remove());
        this.objects = [];
        this.container = null;
        this.field = null;
        this.catcher = null;
    }
};
