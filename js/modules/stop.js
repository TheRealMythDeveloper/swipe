const Stop = {
    container: null,
    onComplete: null,
    target: null,
    interval: null,
    hits: 0,
    required: 5,
    position: 0,
    direction: 1,
    speed: 2,
    active: false,

    start(container, onComplete, difficulty = 1) {
    container.innerHTML = `
        <div style="color:white; text-align:center; padding:40px;">
            STOP MODULE STARTED
        </div>
    `;
    return;

        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 5;
        this.position = 10;
        this.direction = 1;
        this.speed = 1.5 + difficulty * 0.5;
        this.active = true;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:35px;color:#54d6e8">
                <h2>STOP IN THE ZONE</h2>
                <div class="stop-track" style="position:relative;width:80%;height:35px;background:#353b4b;border-radius:20px">
                    <div style="position:absolute;left:45%;width:10%;height:100%;background:#54d6e8;border-radius:20px;opacity:.4"></div>
                    <div class="stop-marker" style="position:absolute;left:10%;top:-5px;width:12px;height:45px;background:white;border-radius:5px"></div>
                </div>
                <p class="stop-progress">HITS: 0 / 5</p>
                <p>CLICK OR RELEASE TO STOP</p>
            </div>
        `;

        this.target = container.querySelector(".stop-marker");

        this.interval = setInterval(() => {
            if (!this.active) return;

            this.position += this.direction * this.speed;

            if (this.position >= 96 || this.position <= 0) {
                this.direction *= -1;
            }

            this.position = Math.max(0, Math.min(96, this.position));
            this.target.style.left = `${this.position}%`;
        }, 16);

        this.handleStop = () => this.attempt();

        container.addEventListener("pointerup", this.handleStop);
    },

    attempt() {
        if (!this.active) return;

        if (this.position >= 43 && this.position <= 53) {
            this.hits++;
            this.container.querySelector(".stop-progress").textContent =
                `HITS: ${this.hits} / ${this.required}`;

            if (this.hits >= this.required) {
                this.active = false;
                this.onComplete?.();
            }
        } else {
            this.hits = 0;
            this.container.querySelector(".stop-progress").textContent =
                "MISSED! START AGAIN";
        }
    },

    cleanup() {
        clearInterval(this.interval);

        if (this.container && this.handleStop) {
            this.container.removeEventListener("pointerup", this.handleStop);
        }

        this.active = false;
        this.container = null;
        this.target = null;
    }
};