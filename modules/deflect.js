const Deflect = {
    container: null,
    field: null,
    onComplete: null,
    active: false,
    animation: null,
    objects: [],
    goal: null,
    score: null,
    hits: 0,
    required: 4,
    lastTime: 0,
    lastSpawn: 0,
    selected: null,
    startX: 0,
    startY: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.objects = [];
        this.hits = 0;
        this.required = 4;
        this.lastTime = 0;
        this.lastSpawn = 0;
        this.selected = null;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:14px;width:100%;text-align:center;z-index:5;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">DEFLECT</h2>
                    <p>Swipe across objects to send them into the goal</p>
                    <p class="deflect-score" style="margin-top:8px">GOALS: 0 / 4</p>
                </div>
                <div class="deflect-field" style="position:absolute;inset:0;overflow:hidden;touch-action:none">
                    <div class="deflect-goal" style="position:absolute;right:5%;top:36%;width:17%;height:28%;border:4px solid #35c978;border-radius:12px;display:grid;place-items:center;color:#35c978;font-weight:bold;pointer-events:none">GOAL</div>
                </div>
            </div>
        `;

        this.field = container.querySelector(".deflect-field");
        this.goal = this.field.querySelector(".deflect-goal");
        this.score = container.querySelector(".deflect-score");

        this.down = event => {
            if (!this.active || this.selected) return;

            const rect = this.field.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const object = this.objects.find(item =>
                !item.deflected &&
                Math.hypot(item.x - x, item.y - y) < 45
            );

            if (!object) return;

            this.selected = object;
            this.startX = event.clientX;
            this.startY = event.clientY;
        };

        this.up = event => {
            if (!this.active || !this.selected) return;

            const object = this.selected;
            this.selected = null;

            const dx = event.clientX - this.startX;
            const dy = event.clientY - this.startY;

            if (Math.hypot(dx, dy) < 12) return;

            const goalRect = this.goal.getBoundingClientRect();
            const fieldRect = this.field.getBoundingClientRect();

            const goalX = goalRect.left - fieldRect.left + goalRect.width / 2;
            const goalY = goalRect.top - fieldRect.top + goalRect.height / 2;

            const aimX = goalX - object.x;
            const aimY = goalY - object.y;
            const aimLength = Math.hypot(aimX, aimY) || 1;

            const swipeLength = Math.hypot(dx, dy) || 1;
            const swipeX = dx / swipeLength;
            const swipeY = dy / swipeLength;

            const blendX = aimX / aimLength * 0.75 + swipeX * 0.25;
            const blendY = aimY / aimLength * 0.75 + swipeY * 0.25;
            const blendLength = Math.hypot(blendX, blendY) || 1;

            object.vx = blendX / blendLength * 480;
            object.vy = blendY / blendLength * 480;
            object.deflected = true;
            object.element.style.background = "#54d6e8";
            object.element.style.borderColor = "white";
        };

        this.field.addEventListener("pointerdown", this.down);
        window.addEventListener("pointerup", this.up);

        this.animation = requestAnimationFrame(time => this.animate(time));
    },

    spawn() {
        const height = this.field.clientHeight;
        const element = document.createElement("div");
        const size = 38;

        element.style.cssText = `
            position:absolute;left:0;top:0;
            width:${size}px;height:${size}px;
            border-radius:50%;background:#ffb454;
            border:3px solid white;box-sizing:border-box;
            transform:translate(-50%,-50%);
            pointer-events:none;z-index:2;
        `;

        const x = -size;
        const y = height * (0.18 + Math.random() * 0.65);

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        this.field.appendChild(element);

        this.objects.push({
            element, x, y,
            vx: 190 + Math.random() * 80,
            vy: (Math.random() - 0.5) * 100,
            deflected: false,
            lastTrail: 0
        });
    },

    animate(time) {
        if (!this.active) return;

        if (!this.lastTime) {
            this.lastTime = time;
            this.lastSpawn = time;
        }

        const delta = Math.min((time - this.lastTime) / 1000, 0.04);
        this.lastTime = time;

        if (time - this.lastSpawn > 900) {
            this.spawn();
            this.lastSpawn = time;
        }

        const width = this.field.clientWidth;
        const height = this.field.clientHeight;

        const goalRect = this.goal.getBoundingClientRect();
        const fieldRect = this.field.getBoundingClientRect();

        const goalLeft = goalRect.left - fieldRect.left;
        const goalRight = goalRect.right - fieldRect.left;
        const goalTop = goalRect.top - fieldRect.top;
        const goalBottom = goalRect.bottom - fieldRect.top;

        this.objects.forEach(object => {
            object.x += object.vx * delta;
            object.y += object.vy * delta;

            object.element.style.left = `${object.x}px`;
            object.element.style.top = `${object.y}px`;

            if (time - object.lastTrail > 45) {
                object.lastTrail = time;
                this.makeTrail(object);
            }

            if (
                object.deflected &&
                object.x >= goalLeft &&
                object.x <= goalRight &&
                object.y >= goalTop &&
                object.y <= goalBottom
            ) {
                object.scored = true;
                object.element.remove();
                this.hits++;
                this.score.textContent = `GOALS: ${this.hits} / ${this.required}`;

                if (this.hits >= this.required) {
                    this.finish(true);
                }
            }
        });

        this.objects = this.objects.filter(object => {
            if (
                object.scored ||
                object.x < -100 || object.x > width + 100 ||
                object.y < -100 || object.y > height + 100
            ) {
                object.element.remove();
                return false;
            }
            return true;
        });

        if (this.active) {
            this.animation = requestAnimationFrame(next => this.animate(next));
        }
    },

    makeTrail(object) {
        const trail = document.createElement("div");

        trail.style.cssText = `
            position:absolute;left:${object.x}px;top:${object.y}px;
            width:15px;height:15px;border-radius:50%;
            background:${object.deflected ? "#54d6e8" : "#ffb454"};
            opacity:.45;transform:translate(-50%,-50%);
            pointer-events:none;
        `;

        this.field.appendChild(trail);

        setTimeout(() => {
            trail.style.transition = "opacity .3s";
            trail.style.opacity = "0";
        }, 10);

        setTimeout(() => trail.remove(), 330);
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

        if (this.field && this.down) {
            this.field.removeEventListener("pointerdown", this.down);
        }

        if (this.up) window.removeEventListener("pointerup", this.up);

        this.objects.forEach(object => object.element.remove());
        this.objects = [];
        this.container = null;
        this.field = null;
        this.goal = null;
    }
};
