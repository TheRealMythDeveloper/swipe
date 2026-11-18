
const Dodge = {
    container: null,
    onComplete: null,
    player: null,
    hazards: [],
    animation: null,
    score: 0,
    required: 8,
    active: false,
    lastSpawn: 0,
    elapsed: 0,
    difficulty: 1,
    spawnDelay: 650,
    lastTime: 0,

    cleanup() {
        if (this.animation) cancelAnimationFrame(this.animation);

        if (this.container) {
            this.container.removeEventListener("pointerdown", this.down);
            this.container.removeEventListener("pointermove", this.move);
        }

        this.hazards.forEach(h => h.element.remove());

        this.hazards = [];
        this.active = false;
        this.animation = null;
        this.container = null;
        this.player = null;
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.score = 0;
        this.required = 12 + difficulty * 2;
        this.active = true;
        this.hazards = [];
        this.elapsed = 0;
        this.difficulty = difficulty;
        this.lastSpawn = 0;
        this.lastTime = 0;

        container.innerHTML = `
            <div class="dodge-arena" style="
                position:relative;
                width:100%;
                height:100%;
                overflow:hidden;
                background:#11141d;
                touch-action:none;
            ">
                <div class="dodge-score" style="
                    position:absolute;
                    top:15px;
                    left:0;
                    width:100%;
                    text-align:center;
                    color:#54d6e8;
                    font-size:18px;
                    font-weight:bold;
                    z-index:5;
                    pointer-events:none;
                ">SURVIVE: 0 / ${this.required}</div>

                <div class="dodge-warning" style="
                    position:absolute;
                    bottom:10px;
                    left:0;
                    width:100%;
                    text-align:center;
                    color:#8993a8;
                    font-size:13px;
                    z-index:5;
                    pointer-events:none;
                ">KEEP MOVING</div>

                <div class="dodge-player" style="
                    position:absolute;
                    bottom:8%;
                    left:50%;
                    width:30px;
                    height:30px;
                    background:#54d6e8;
                    border-radius:50%;
                    transform:translateX(-50%);
                    box-shadow:0 0 12px #54d6e855;
                    z-index:2;
                "></div>

                <div class="dodge-hazards"></div>
            </div>
        `;

        this.player = container.querySelector(".dodge-player");
        this.layer = container.querySelector(".dodge-hazards");

        this.down = event => this.movePlayer(event);
        this.move = event => this.movePlayer(event);

        container.addEventListener("pointerdown", this.down);
        container.addEventListener("pointermove", this.move);

        this.loop = time => {
            if (!this.active) return;

            const delta = Math.min((time - (this.lastTime || time)) / 16.67, 2);
            this.lastTime = time;

            this.elapsed += delta;

            const arena = container.getBoundingClientRect();
            const playerRect = this.player.getBoundingClientRect();

            // Difficulty rises as survival progresses
            const ramp = Math.min(this.score / this.required, 1);

            this.spawnDelay = Math.max(
                240,
                650 - this.difficulty * 55 - ramp * 250
            );

            // Spawn hazards
            if (time - this.lastSpawn >= this.spawnDelay) {
                this.spawn();
                this.lastSpawn = time;

                // Occasional burst
                if (Math.random() < 0.18 + ramp * 0.25) {
                    setTimeout(() => {
                        if (this.active) this.spawn();
                    }, 160);
                }
            }

            for (const hazard of [...this.hazards]) {
                hazard.y += hazard.speed * delta;
                hazard.x += hazard.drift * delta;

                // Sweep hazards reverse at arena edges
                if (hazard.x < 0 || hazard.x + hazard.size > arena.width) {
                    hazard.drift *= -1;
                }

                hazard.element.style.top = `${hazard.y}px`;
                hazard.element.style.left = `${hazard.x}px`;

                const h = hazard.element.getBoundingClientRect();

                const overlap =
                    h.left < playerRect.right - 3 &&
                    h.right > playerRect.left + 3 &&
                    h.top < playerRect.bottom - 3 &&
                    h.bottom > playerRect.top + 3;

                if (overlap) {
                    this.finish(false);
                    return;
                }

                if (hazard.y > arena.height) {
                    hazard.element.remove();
                    this.hazards = this.hazards.filter(item => item !== hazard);
                    this.score++;

                    const scoreDisplay = container.querySelector(".dodge-score");

                    if (scoreDisplay) {
                        scoreDisplay.textContent =
                            `SURVIVE: ${this.score} / ${this.required}`;
                    }

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
        if (!this.active || !this.player) return;

        const rect = this.container.getBoundingClientRect();

        const x = Math.max(
            16,
            Math.min(rect.width - 16, event.clientX - rect.left)
        );

        this.player.style.left = `${x}px`;
    },

    spawn() {
        const arena = this.container.getBoundingClientRect();

        const sizeOptions = [16, 22, 30, 38];
        const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];

        const object = document.createElement("div");

        const driftChance = Math.random();
        let drift = 0;

        if (driftChance < 0.35) {
            drift = (Math.random() < 0.5 ? -1 : 1) *
                (1.2 + Math.random() * 2.5);
        }

        Object.assign(object.style, {
            position: "absolute",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: size > 30 ? "3px" : "50%",
            background: size > 30 ? "#ff3158" : "#ff4268",
            boxShadow: "0 0 8px #ff426844",
            left: `${Math.random() * (arena.width - size)}px`,
            top: "-45px"
        });

        this.layer.appendChild(object);

        const ramp = Math.min(this.score / this.required, 1);

        this.hazards.push({
            element: object,
            x: parseFloat(object.style.left),
            y: -45,
            size,
            drift,
            speed:
                (3 + Math.random() * 2.5 + this.difficulty * 0.65) *
                (1 + ramp * 0.6)
        });
    },

    finish(success) {
        if (!this.active) return;

        this.active = false;

        if (this.animation) cancelAnimationFrame(this.animation);

        this.onComplete?.(success);
    }
};
