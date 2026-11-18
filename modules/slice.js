const Slice = {
    container: null,
    field: null,
    onComplete: null,
    active: false,
    animation: null,
    objects: [],
    trails: [],
    hits: 0,
    required: 6,
    lastTime: 0,
    lastSpawn: 0,
    lastX: null,
    lastY: null,
    lastTrail: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.hits = 0;
        this.objects = [];
        this.trails = [];
        this.lastTime = 0;
        this.lastSpawn = 0;
        this.lastX = null;
        this.lastY = null;
        this.lastTrail = 0;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:14px;width:100%;text-align:center;z-index:5;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">SLICE</h2>
                    <p>Swipe through targets. Avoid red hazards.</p>
                    <p class="slice-score" style="margin-top:8px">SLICED: 0 / 6</p>
                </div>
                <div class="slice-field" style="position:absolute;inset:0;overflow:hidden;touch-action:none"></div>
            </div>
        `;

        this.field = container.querySelector(".slice-field");
        this.score = container.querySelector(".slice-score");

        this.handleMove = event => {
            if (!this.active) return;

            const rect = this.field.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (this.lastX !== null) {
                this.makeTrail(x, y);
                this.checkSwipe(this.lastX, this.lastY, x, y);
            }

            this.lastX = x;
            this.lastY = y;
        };

        this.handleUp = () => {
            this.lastX = null;
            this.lastY = null;
        };

        this.field.addEventListener("pointerdown", this.handleMove);
        this.field.addEventListener("pointermove", this.handleMove);
        this.field.addEventListener("pointerup", this.handleUp);
        this.field.addEventListener("pointerleave", this.handleUp);

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

        if (time - this.lastSpawn > 650) {
            this.spawn();
            this.lastSpawn = time;
        }

        const width = this.field.clientWidth;
        const height = this.field.clientHeight;

        this.objects.forEach(object => {
            object.x += object.vx * delta;
            object.y += object.vy * delta;
            object.age += delta;

            object.element.style.left = `${object.x}px`;
            object.element.style.top = `${object.y}px`;
            object.element.style.transform = `translate(-50%,-50%) rotate(${object.age * 180}deg)`;

            if (time - object.lastTrail > 65) {
                object.lastTrail = time;
                this.makeObjectTrail(object);
            }
        });

        this.objects = this.objects.filter(object => {
            if (
                object.x < -90 || object.x > width + 90 ||
                object.y < -90 || object.y > height + 90
            ) {
                object.element.remove();
                return false;
            }
            return true;
        });

        this.animation = requestAnimationFrame(next => this.animate(next));
    },

    spawn() {
        const width = this.field.clientWidth;
        const height = this.field.clientHeight;
        const hazard = Math.random() < 0.24;
        const size = hazard ? 43 : 48;

        const element = document.createElement("div");

        element.style.cssText = `
            position:absolute;
            left:0;
            top:0;
            width:${size}px;
            height:${size}px;
            background:${hazard ? "#ff4268" : "#54d6e8"};
            border:4px solid white;
            border-radius:${hazard ? "7px" : "50%"};
            box-sizing:border-box;
            transform:translate(-50%,-50%);
            pointer-events:none;
            z-index:2;
        `;

        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;

        if (side === 0) {
            x = -size;
            y = Math.random() * height;
            vx = 180 + Math.random() * 140;
            vy = (Math.random() - 0.5) * 300;
        } else if (side === 1) {
            x = width + size;
            y = Math.random() * height;
            vx = -180 - Math.random() * 140;
            vy = (Math.random() - 0.5) * 300;
        } else if (side === 2) {
            x = Math.random() * width;
            y = -size;
            vx = (Math.random() - 0.5) * 300;
            vy = 180 + Math.random() * 140;
        } else {
            x = Math.random() * width;
            y = height + size;
            vx = (Math.random() - 0.5) * 300;
            vy = -180 - Math.random() * 140;
        }

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        this.field.appendChild(element);

        this.objects.push({
            element, x, y, vx, vy, size,
            hazard, age: 0, lastTrail: 0
        });
    },

    checkSwipe(x1, y1, x2, y2) {
        for (const object of [...this.objects]) {
            const distance = this.segmentDistance(
                x1, y1, x2, y2, object.x, object.y
            );

            if (distance < object.size * 0.65) {
                if (object.hazard) {
                    this.finish(false);
                    return;
                }

                object.element.remove();
                this.objects = this.objects.filter(item => item !== object);
                this.hits++;
                this.score.textContent = `SLICED: ${this.hits} / ${this.required}`;

                if (this.hits >= this.required) {
                    this.finish(true);
                    return;
                }
            }
        }
    },

    segmentDistance(x1, y1, x2, y2, px, py) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = dx * dx + dy * dy;

        if (!length) return Math.hypot(px - x1, py - y1);

        const t = Math.max(0, Math.min(1,
            ((px - x1) * dx + (py - y1) * dy) / length
        ));

        return Math.hypot(
            px - (x1 + t * dx),
            py - (y1 + t * dy)
        );
    },

    makeTrail(x, y) {
        const now = performance.now();
        if (now - this.lastTrail < 20) return;
        this.lastTrail = now;

        const trail = document.createElement("div");
        trail.style.cssText = `
            position:absolute;left:${x}px;top:${y}px;
            width:12px;height:12px;border-radius:50%;
            background:white;opacity:.7;
            transform:translate(-50%,-50%);
            pointer-events:none;z-index:4;
        `;

        this.field.appendChild(trail);
        setTimeout(() => {
            trail.style.transition = "opacity .25s";
            trail.style.opacity = "0";
        }, 10);
        setTimeout(() => trail.remove(), 280);
    },

    makeObjectTrail(object) {
        const trail = document.createElement("div");
        trail.style.cssText = `
            position:absolute;left:${object.x}px;top:${object.y}px;
            width:17px;height:17px;border-radius:50%;
            background:${object.hazard ? "#ff4268" : "#54d6e8"};
            opacity:.35;transform:translate(-50%,-50%);
            pointer-events:none;z-index:1;
        `;

        this.field.appendChild(trail);
        setTimeout(() => {
            trail.style.transition = "opacity .3s";
            trail.style.opacity = "0";
        }, 10);
        setTimeout(() => trail.remove(), 320);
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

        if (this.field) {
            this.field.removeEventListener("pointerdown", this.handleMove);
            this.field.removeEventListener("pointermove", this.handleMove);
            this.field.removeEventListener("pointerup", this.handleUp);
            this.field.removeEventListener("pointerleave", this.handleUp);
        }

        this.objects.forEach(object => object.element.remove());
        this.objects = [];
        this.container = null;
        this.field = null;
    }
};
