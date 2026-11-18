
const Follow = {
    container: null,
    onComplete: null,
    active: false,
    animation: null,
    target: null,
    progressBar: null,
    field: null,
    pointerX: -1000,
    pointerY: -1000,
    x: 0,
    y: 0,
    vx: 180,
    vy: 130,
    progress: 0,
    required: 3.5,
    lastTime: 0,
    lastTrail: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.progress = 0;
        this.required = 3.5;
        this.lastTime = 0;
        this.lastTrail = 0;
        this.pointerX = -1000;
        this.pointerY = -1000;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:15px;width:100%;text-align:center;z-index:5;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">FOLLOW</h2>
                    <p>Keep your cursor close to the moving target</p>
                    <p class="follow-score" style="margin-top:10px">TRACKING: 0%</p>
                    <div style="width:60%;height:9px;background:#343b4b;margin:10px auto;border-radius:10px;overflow:hidden">
                        <div class="follow-progress" style="width:0%;height:100%;background:#54d6e8"></div>
                    </div>
                </div>
                <div class="follow-field" style="position:absolute;inset:0;overflow:hidden"></div>
            </div>
        `;

        this.field = container.querySelector(".follow-field");
        this.progressBar = container.querySelector(".follow-progress");
        this.scoreLabel = container.querySelector(".follow-score");

        const width = this.field.clientWidth;
        const height = this.field.clientHeight;

        this.x = width * 0.5;
        this.y = height * 0.6;
        this.vx = 180 + difficulty * 25;
        this.vy = 135 + difficulty * 18;

        this.target = document.createElement("div");
        this.target.style.cssText = `
            position:absolute;
            width:58px;
            height:58px;
            left:${this.x}px;
            top:${this.y}px;
            border:5px solid white;
            border-radius:50%;
            background:#35c978;
            box-sizing:border-box;
            transform:translate(-50%,-50%);
            pointer-events:none;
            z-index:3;
        `;

        this.field.appendChild(this.target);

        this.handleMove = event => {
            const rect = this.field.getBoundingClientRect();
            this.pointerX = event.clientX - rect.left;
            this.pointerY = event.clientY - rect.top;

            const now = performance.now();

            if (now - this.lastTrail > 35) {
                this.lastTrail = now;
                this.makeTrail(this.pointerX, this.pointerY, "#ffffff", 9);
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

        this.x += this.vx * delta;
        this.y += this.vy * delta;

        if (this.x > width + 55) this.x = -55;
        if (this.x < -55) this.x = width + 55;
        if (this.y > height + 55) this.y = -55;
        if (this.y < -55) this.y = height + 55;

        this.target.style.left = `${this.x}px`;
        this.target.style.top = `${this.y}px`;

        const distance = Math.hypot(
            this.pointerX - this.x,
            this.pointerY - this.y
        );

        if (distance < 85) {
            this.progress += delta;
        } else {
            this.progress = Math.max(0, this.progress - delta * 0.35);
        }

        const percent = Math.min(100, this.progress / this.required * 100);

        this.progressBar.style.width = `${percent}%`;
        this.scoreLabel.textContent = `TRACKING: ${Math.floor(percent)}%`;

        if (time - this.lastTrail > 55) {
            this.lastTrail = time;
            this.makeTrail(this.x, this.y, "#35c978", 24);
        }

        if (this.progress >= this.required) {
            this.finish(true);
            return;
        }

        this.animation = requestAnimationFrame(next => this.animate(next));
    },

    makeTrail(x, y, color, size) {
        const trail = document.createElement("div");

        trail.style.cssText = `
            position:absolute;
            left:${x}px;
            top:${y}px;
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            opacity:.5;
            transform:translate(-50%,-50%);
            pointer-events:none;
            z-index:1;
        `;

        this.field.appendChild(trail);

        setTimeout(() => {
            trail.style.transition = "opacity .35s, transform .35s";
            trail.style.opacity = "0";
            trail.style.transform = "translate(-50%,-50%) scale(.2)";
        }, 10);

        setTimeout(() => trail.remove(), 400);
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animation);
        if (success) this.onComplete?.(true);
    },

    cleanup() {
        this.active = false;
        if (this.animation) cancelAnimationFrame(this.animation);

        if (this.field && this.handleMove) {
            this.field.removeEventListener("pointermove", this.handleMove);
        }

        this.container = null;
        this.field = null;
        this.target = null;
        this.progressBar = null;
        this.scoreLabel = null;
    }
};
