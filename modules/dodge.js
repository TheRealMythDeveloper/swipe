const Dodge = {
    container: null,
    onComplete: null,
    player: null,
    hazards: [],
    interval: null,
    animation: null,
    score: 0,
    required: 5,
    active: false,
    lastSpawn: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.score = 0;
        this.required = 5 + Math.floor(difficulty);
        this.active = true;
        this.hazards = [];
        this.lastSpawn = 0;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;overflow:hidden;background:#171a24">
                <div class="dodge-score" style="position:absolute;top:10px;width:100%;text-align:center;color:#54d6e8">SURVIVE: 0 / ${this.required}</div>
                <div class="dodge-player" style="position:absolute;bottom:12%;left:50%;transform:translateX(-50%);width:45px;height:45px;background:#54d6e8;border-radius:50%;touch-action:none"></div>
                <div class="dodge-hazards"></div>
            </div>
        `;

        this.player = container.querySelector(".dodge-player");
        this.layer = container.querySelector(".dodge-hazards");

        this.down = event => {
            this.movePlayer(event);
        };

        this.move = event => {
            this.movePlayer(event);
        };

        container.addEventListener("pointerdown", this.down);
        container.addEventListener("pointermove", this.move);

        this.loop = () => {
            if (!this.active) return;

            const now = performance.now();

            if (now - this.lastSpawn > Math.max(300, 900 - difficulty * 100)) {
                this.spawn();
                this.lastSpawn = now;
            }

            const bounds = this.container.getBoundingClientRect();
            const playerRect = this.player.getBoundingClientRect();

            for (const hazard of [...this.hazards]) {
                hazard.y += hazard.speed;
                hazard.element.style.top = `${hazard.y}px`;

                const h = hazard.element.getBoundingClientRect();

                const overlap =
                    h.left < playerRect.right &&
                    h.right > playerRect.left &&
                    h.top < playerRect.bottom &&
                    h.bottom > playerRect.top;

                if (overlap) {
                    this.finish(false);
                    return;
                }

                if (hazard.y > bounds.height) {
                    hazard.element.remove();
                    this.hazards = this.hazards.filter(item => item !== hazard);
                    this.score++;

                    container.querySelector(".dodge-score").textContent =
                        `SURVIVE: ${this.score} / ${this.required}`;

                    if (this.score >= this.required) {
                        this.finish(true);
                        return;
                    }
                }
            }

            this.animation = requestAnimationFrame(this.loop);
        };

        this.animation = requestAnimationFrame(this.loop);
    },

    movePlayer(event) {
        const rect = this.container.getBoundingClientRect();
        const x = Math.max(22, Math.min(rect.width - 22, event.clientX - rect.left));
        this.player.style.left = `${x}px`;
        this.player.style.transform = "translateX(-50%)";
    },

    spawn() {
        const object = document.createElement("div");

        Object.assign(object.style, {
            position: "absolute",
            width: "28px",
            height: "28px",
            borderRadius: "5px",
            background: "#ff4268",
            left: `${Math.random() * 90 + 5}%`,
            top: "-30px"
        });

        this.layer.appendChild(object);

        this.hazards.push({
            element: object,
            y: -30,
            speed: 2 + Math.random() * 2
        });
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;

        if (success) this.onComplete?.();
        else this.onComplete?.(false);
    },

    cleanup() {
        if (this.animation) cancelAnimationFrame(this.animation);
        if (this.container) {
            this.container.removeEventListener("pointerdown", this.down);
            this.container.removeEventListener("pointermove", this.move);
        }

        this.hazards.forEach(item => item.element.remove());
        this.hazards = [];
        this.active = false;
        this.container = null;
        this.player = null;
    }
};
