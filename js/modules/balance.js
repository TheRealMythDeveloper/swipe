const Balance = {
    container: null,
    onComplete: null,
    zone: null,
    object: null,
    animation: null,
    position: 50,
    direction: 1,
    progress: 0,
    required: 5,
    active: false,
    lastTime: 0,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.position = 50;
        this.direction = 1;
        this.progress = 0;
        this.required = 5 + Math.floor(difficulty);
        this.active = true;
        this.lastTime = 0;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;color:#54d6e8">
                <h2>KEEP IT BALANCED</h2>
                <div class="balance-track" style="position:relative;width:80%;height:20px;background:#353b4b;border-radius:20px">
                    <div class="balance-zone" style="position:absolute;left:40%;width:20%;height:100%;background:#54d6e8;opacity:.5;border-radius:20px"></div>
                    <div class="balance-object" style="position:absolute;left:50%;top:-12px;width:25px;height:44px;background:white;border-radius:8px;transform:translateX(-50%)"></div>
                </div>
                <p class="balance-progress">BALANCE: 0 / ${this.required}</p>
                <p>MOVE YOUR POINTER TO STEER</p>
            </div>
        `;

        this.zone = container.querySelector(".balance-zone");
        this.object = container.querySelector(".balance-object");
        this.track = container.querySelector(".balance-track");

        this.move = event => {
            const rect = this.track.getBoundingClientRect();
            const x = event.clientX - rect.left;
            this.position = Math.max(0, Math.min(100, x / rect.width * 100));
        };

        container.addEventListener("pointermove", this.move);

        this.loop = timestamp => {
            if (!this.active) return;

            if (!this.lastTime) this.lastTime = timestamp;
            const delta = Math.min(40, timestamp - this.lastTime);
            this.lastTime = timestamp;

            const speed = 0.035 + difficulty * 0.01;

            this.direction = this.position > 50 ? 1 : -1;

            const center = 50 + Math.sin(timestamp * 0.0015) * 25;
            const objectPosition = center + (this.position - 50) * 0.25;

            this.object.style.left = `${objectPosition}%`;

            const zoneCenter = center;

            if (Math.abs(objectPosition - zoneCenter) < 7) {
                this.progress += delta / 1000;
            } else {
                this.progress = Math.max(0, this.progress - delta / 2000);
            }

            const display = Math.floor(this.progress);
            this.container.querySelector(".balance-progress").textContent =
                `BALANCE: ${display} / ${this.required}`;

            if (this.progress >= this.required) {
                this.active = false;
                this.onComplete?.();
                return;
            }

            this.animation = requestAnimationFrame(this.loop);
        };

        this.animation = requestAnimationFrame(this.loop);
    },

    cleanup() {
        if (this.animation) cancelAnimationFrame(this.animation);

        if (this.container) {
            this.container.removeEventListener("pointermove", this.move);
        }

        this.active = false;
        this.container = null;
    }
};