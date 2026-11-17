const Catch = {
    container: null,
    onComplete: null,
    player: null,
    objects: [],
    animation: null,
    score: 0,
    required: 6,
    active: false,
    lastSpawn: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.score = 0;
        this.required = 6 + Math.floor(difficulty);
        this.active = true;
        this.objects = [];
        this.lastSpawn = 0;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;overflow:hidden">
                <div class="catch-score" style="position:absolute;top:12px;width:100%;text-align:center;color:#54d6e8">
                    CAUGHT: 0 / ${this.required}
                </div>
                <div class="catch-player" style="position:absolute;bottom:8%;left:50%;width:65px;height:18px;transform:translateX(-50%);background:#54d6e8;border-radius:8px;touch-action:none"></div>
                <div class="catch-objects"></div>
            </div>
        `;

        this.player = container.querySelector(".catch-player");
        this.layer = container.querySelector(".catch-objects");

        this.move = event => {
            const rect = container.getBoundingClientRect();
            const x = Math.max(32, Math.min(rect.width - 32, event.clientX - rect.left));
            this.player.style.left = `${x}px`;
        };

        container.addEventListener("pointermove", this.move);
        container.addEventListener("pointerdown", this.move);

        this.loop = () => {
            if (!this.active) return;

            const now = performance.now();

            if (now - this.lastSpawn > Math.max(350, 1000 - difficulty * 100)) {
                this.spawn();
                this.lastSpawn = now;
            }

            const playerRect = this.player.getBoundingClientRect();

            for (const object of [...this.objects]) {
                object.y += object.speed;
                object.element.style.top = `${object.y}px`;

                const rect = object.element.getBoundingClientRect();

                const caught =
                    rect.left < playerRect.right &&
                    rect.right > playerRect.left &&
                    rect.top < playerRect.bottom &&
                    rect.bottom > playerRect.top;

                if (caught) {
                    object.element.remove();
                    this.objects = this.objects.filter(item => item !== object);
                    this.score++;

                    this.container.querySelector(".catch-score").textContent =
                        `CAUGHT: ${this.score} / ${this.required}`;

                    if (this.score >= this.required) {
                        this.finish();
                        return;
                    }
                } else if (object.y > this.container.clientHeight) {
                    object.element.remove();
                    this.objects = this.objects.filter(item => item !== object);
                }
            }

            this.animation = requestAnimationFrame(this.loop);
        };

        this.animation = requestAnimationFrame(this.loop);
    },

    spawn() {
        const element = document.createElement("div");

        Object.assign(element.style, {
            position: "absolute",
            top: "-25px",
            left: `${Math.random() * 90 + 5}%`,
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#ff4268"
        });

        this.layer.appendChild(element);

        this.objects.push({
            element,
            y: -25,
            speed: 2 + Math.random() * 2
        });
    },

    finish() {
        if (!this.active) return;
        this.active = false;
        this.onComplete?.();
    },

    cleanup() {
        if (this.animation) cancelAnimationFrame(this.animation);

        if (this.container) {
            this.container.removeEventListener("pointermove", this.move);
            this.container.removeEventListener("pointerdown", this.move);
        }

        this.objects.forEach(item => item.element.remove());
        this.objects = [];
        this.active = false;
        this.container = null;
    }
};