
const Direction = {
    container: null,
    onComplete: null,
    direction: null,
    startPoint: null,
    hits: 0,
    required: 5,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 5 + Math.floor(difficulty);
        this.nextDirection();

        this.handleDown = event => {
            this.startPoint = { x: event.clientX, y: event.clientY };
        };

        this.handleUp = event => {
            if (!this.startPoint) return;

            const dx = event.clientX - this.startPoint.x;
            const dy = event.clientY - this.startPoint.y;

            this.startPoint = null;

            if (Math.hypot(dx, dy) < 35) return;

            const actual = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? "RIGHT" : "LEFT")
                : (dy > 0 ? "DOWN" : "UP");

            if (actual === this.direction) {
                this.hits++;
                if (this.hits >= this.required) {
                    this.onComplete?.();
                } else {
                    this.nextDirection();
                }
            } else {
                this.showMessage("WRONG DIRECTION");
            }
        };

        container.addEventListener("pointerdown", this.handleDown);
        window.addEventListener("pointerup", this.handleUp);
    },

    nextDirection() {
        const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
        this.direction = directions[Math.floor(Math.random() * 4)];

        this.container.innerHTML = `
            <div style="text-align:center;color:#54d6e8">
                <h1 style="font-size:60px">${{
                    UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→"
                }[this.direction]}</h1>
                <p>SWIPE ${this.direction}</p>
                <p> ${this.hits} / ${this.required}</p>
            </div>
        `;
    },

    showMessage(message) {
        const p = this.container.querySelector("p:last-child");
        if (p) p.textContent = message;
    },

    cleanup() {
        if (this.container && this.handleDown) {
            this.container.removeEventListener("pointerdown", this.handleDown);
        }
        if (this.handleUp) window.removeEventListener("pointerup", this.handleUp);
        this.container = null;
        this.startPoint = null;
    }
};
