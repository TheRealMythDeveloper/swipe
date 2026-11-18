
const Direction = {
    container: null,
    field: null,
    onComplete: null,
    active: false,
    arrow: null,
    label: null,
    progress: null,
    direction: null,
    startX: 0,
    startY: 0,
    dragging: false,
    hits: 0,
    required: 4,
    directions: ["UP", "DOWN", "LEFT", "RIGHT"],
    symbols: { UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" },

    start(container, onComplete) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.hits = 0;
        this.required = 4;
        this.dragging = false;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden;display:flex;align-items:center;justify-content:center">
                <div style="position:absolute;top:15px;width:100%;text-align:center;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">DIRECTION</h2>
                    <p>Swipe in the direction shown</p>
                    <p class="direction-progress" style="margin-top:8px">CORRECT: 0 / 4</p>
                </div>
                <div class="direction-field" style="position:absolute;inset:0;touch-action:none"></div>
                <div class="direction-arrow" style="position:absolute;width:150px;height:150px;display:grid;place-items:center;border:5px solid #54d6e8;border-radius:22px;color:#54d6e8;font-size:105px;pointer-events:none">↑</div>
                <p class="direction-label" style="position:absolute;bottom:12%;font-size:18px;letter-spacing:3px;pointer-events:none">SWIPE UP</p>
            </div>
        `;

        this.field = container.querySelector(".direction-field");
        this.arrow = container.querySelector(".direction-arrow");
        this.label = container.querySelector(".direction-label");
        this.progress = container.querySelector(".direction-progress");

        this.nextDirection();

        this.down = event => {
            if (!this.active || this.dragging) return;
            this.dragging = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
        };

        this.up = event => {
            if (!this.active || !this.dragging) return;
            this.dragging = false;

            const dx = event.clientX - this.startX;
            const dy = event.clientY - this.startY;

            if (Math.hypot(dx, dy) < 45) return;

            let result;

            if (Math.abs(dx) > Math.abs(dy)) {
                result = dx > 0 ? "RIGHT" : "LEFT";
            } else {
                result = dy > 0 ? "DOWN" : "UP";
            }

            if (result === this.direction) {
                this.hits++;
                this.progress.textContent =
                    `CORRECT: ${this.hits} / ${this.required}`;

                if (this.hits >= this.required) {
                    this.finish(true);
                    return;
                }

                this.nextDirection();
            } else {
                this.label.textContent = "WRONG WAY! TRY AGAIN";
            }
        };

        this.field.addEventListener("pointerdown", this.down);
        window.addEventListener("pointerup", this.up);
    },

    nextDirection() {
        this.direction = this.directions[
            Math.floor(Math.random() * this.directions.length)
        ];

        const width = this.field.clientWidth;
        const height = this.field.clientHeight;

        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.35 + Math.random() * 0.4);

        this.arrow.textContent = this.symbols[this.direction];
        this.arrow.style.left = `${x}px`;
        this.arrow.style.top = `${y}px`;
        this.arrow.style.transform = "translate(-50%,-50%)";
        this.label.textContent = `SWIPE ${this.direction}`;
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;
        this.onComplete?.(success);
    },

    cleanup() {
        this.active = false;

        if (this.field && this.down) {
            this.field.removeEventListener("pointerdown", this.down);
        }

        if (this.up) window.removeEventListener("pointerup", this.up);

        this.container = null;
        this.field = null;
        this.arrow = null;
    }
};
