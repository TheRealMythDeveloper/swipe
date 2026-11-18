const Stop = {
    container: null,
    onComplete: null,
    marker: null,
    zone: null,
    progress: null,
    animation: null,
    active: false,
    position: 5,
    direction: 1,
    speed: 0.045,
    hits: 0,
    required: 4,
    zonePosition: 43,
    lastTime: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 4;
        this.position = 5;
        this.direction = 1;
        this.speed = 0.045 + difficulty * 0.012;
        this.zonePosition = 43;
        this.lastTime = 0;
        this.active = true;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;min-height:300px;background:#171a24;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:35px;overflow:hidden">
                <h2 style="color:#54d6e8">STOP IN THE ZONE</h2>
                <p>Click when the marker enters the highlighted area.</p>
                <div style="position:relative;width:86%;height:48px;background:#343b4b;border-radius:5px">
                    <div class="stop-zone" style="position:absolute;top:0;left:43%;width:12%;height:100%;background:#35c978;opacity:.55"></div>
                    <div class="stop-marker" style="position:absolute;top:-9px;left:5%;width:8px;height:66px;background:white;border-radius:4px"></div>
                </div>
                <p class="stop-progress">HITS: 0 / 4</p>
                <p class="stop-message">READY?</p>
            </div>
        `;

        this.marker = container.querySelector(".stop-marker");
        this.zone = container.querySelector(".stop-zone");
        this.progress = container.querySelector(".stop-progress");
        this.message = container.querySelector(".stop-message");

        this.handlePress = () => this.attempt();
        container.addEventListener("pointerdown", this.handlePress);

        this.animation = requestAnimationFrame(time => this.animate(time));
    },

    animate(time) {
        if (!this.active) return;

        if (!this.lastTime) this.lastTime = time;

        const delta = Math.min(time - this.lastTime, 40);
        this.lastTime = time;

        this.position += this.direction * this.speed * delta;

        if (this.position >= 96) {
            this.position = 96;
            this.direction = -1;
        }

        if (this.position <= 2) {
            this.position = 2;
            this.direction = 1;
        }

        this.marker.style.left = `${this.position}%`;

        this.animation = requestAnimationFrame(nextTime => this.animate(nextTime));
    },

    attempt() {
        if (!this.active) return;

        if (
            this.position >= this.zonePosition &&
            this.position <= this.zonePosition + 12
        ) {
            this.hits++;
            this.progress.textContent = `HITS: ${this.hits} / ${this.required}`;
            this.message.textContent = "NICE HIT";

            if (this.hits >= this.required) {
                this.active = false;
                this.onComplete?.(true);
                return;
            }

            this.zonePosition = 8 + Math.random() * 76;
            this.zone.style.left = `${this.zonePosition}%`;
        } else {
            this.message.textContent = "MISSED. TRY AGAIN";
        }
    },

    cleanup() {
        if (this.animation) cancelAnimationFrame(this.animation);

        if (this.container && this.handlePress) {
            this.container.removeEventListener("pointerdown", this.handlePress);
        }

        this.active = false;
        this.container = null;
        this.marker = null;
        this.zone = null;
        this.progress = null;
        this.animation = null;
    }
};
