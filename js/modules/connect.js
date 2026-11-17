const Connect = {
    container: null,
    onComplete: null,
    points: [],
    selected: null,
    connections: [],
    required: 4,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.required = 4 + Math.floor(difficulty);
        this.points = [];
        this.connections = [];
        this.selected = null;
        this.active = true;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;overflow:hidden">
                <canvas class="connect-canvas" style="width:100%;height:100%;touch-action:none"></canvas>
                <div class="connect-label" style="position:absolute;top:12px;width:100%;text-align:center;color:#54d6e8">
                    CONNECT THE MATCHING POINTS
                </div>
                <div class="connect-progress" style="position:absolute;bottom:12px;width:100%;text-align:center;color:#54d6e8">
                    0 / ${this.required}
                </div>
            </div>
        `;

        this.canvas = container.querySelector(".connect-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.resize();

        const positions = [];

        for (let i = 0; i < this.required; i++) {
            positions.push({
                x: this.canvas.width * (0.2 + Math.random() * 0.6),
                y: this.canvas.height * (0.2 + Math.random() * 0.6)
            });
        }

        this.points = positions.map((position, index) => ({
            ...position,
            id: index,
            connected: false
        }));

        this.draw();

        this.down = event => {
            if (!this.active) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const point = this.points.find(p =>
                Math.hypot(p.x - x, p.y - y) < 25
            );

            if (!point) return;

            if (!this.selected) {
                this.selected = point;
            } else if (point !== this.selected && !point.connected) {
                this.connections.push([this.selected, point]);
                this.selected.connected = true;
                point.connected = true;
                this.selected = null;

                this.container.querySelector(".connect-progress").textContent =
                    `${this.connections.length} / ${this.required}`;

                if (this.connections.length >= this.required) {
                    this.active = false;
                    this.onComplete?.();
                }
            }

            this.draw();
        };

        this.canvas.addEventListener("pointerdown", this.down);
    },

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.strokeStyle = "#54d6e8";
        ctx.lineWidth = 3;

        this.connections.forEach(([a, b]) => {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });

        this.points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = point.connected ? "#54d6e8" : "#ff4268";
            ctx.fill();
        });

        if (this.selected) {
            ctx.beginPath();
            ctx.arc(this.selected.x, this.selected.y, 19, 0, Math.PI * 2);
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
    },

    cleanup() {
        if (this.canvas && this.down) {
            this.canvas.removeEventListener("pointerdown", this.down);
        }

        this.points = [];
        this.connections = [];
        this.selected = null;
        this.active = false;
        this.container = null;
        this.canvas = null;
    }
};