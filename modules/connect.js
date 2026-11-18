
const Connect = {
    container: null,
    onComplete: null,
    field: null,
    canvas: null,
    ctx: null,
    points: [],
    selected: null,
    connections: [],
    active: false,
    required: 4,
    completed: 0,
    pointer: null,
    colors: ["#54d6e8", "#ffb454", "#bd85ff", "#35c978"],

    start(container, onComplete) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.required = 4;
        this.completed = 0;
        this.points = [];
        this.connections = [];
        this.selected = null;
        this.pointer = null;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:15px;width:100%;text-align:center;z-index:3;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">CONNECT</h2>
                    <p>Connect dots with matching colors</p>
                    <p class="connect-progress" style="margin-top:8px">PAIRS: 0 / 4</p>
                </div>
                <canvas class="connect-canvas" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none"></canvas>
            </div>
        `;

        this.canvas = container.querySelector(".connect-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.progressLabel = container.querySelector(".connect-progress");

        this.resize();

        const width = this.canvas.width;
        const height = this.canvas.height;

        const positions = [
            [0.18, 0.32], [0.78, 0.35],
            [0.30, 0.62], [0.68, 0.70],
            [0.48, 0.40], [0.88, 0.75],
            [0.12, 0.78], [0.53, 0.82]
        ];

        const shuffled = [...positions].sort(() => Math.random() - 0.5);

        this.colors.forEach((color, pair) => {
            for (let i = 0; i < 2; i++) {
                const position = shuffled[pair * 2 + i];

                this.points.push({
                    x: width * position[0],
                    y: height * position[1],
                    color,
                    pair,
                    connected: false
                });
            }
        });

        this.down = event => {
            if (!this.active) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const point = this.points.find(p =>
                !p.connected && Math.hypot(p.x - x, p.y - y) < 30
            );

            if (!point) return;

            if (!this.selected) {
                this.selected = point;
                this.pointer = { x, y };
            } else if (point === this.selected) {
                this.selected = null;
                this.pointer = null;
            } else if (point.pair === this.selected.pair) {
                this.connections.push({
                    a: this.selected,
                    b: point,
                    color: point.color
                });

                this.selected.connected = true;
                point.connected = true;
                this.selected = null;
                this.pointer = null;
                this.completed++;

                this.progressLabel.textContent =
                    `PAIRS: ${this.completed} / ${this.required}`;

                if (this.completed >= this.required) {
                    this.draw();
                    this.active = false;
                    this.onComplete?.(true);
                    return;
                }
            } else {
                this.selected = point;
                this.pointer = { x, y };
            }

            this.draw();
        };

        this.move = event => {
            if (!this.active || !this.selected) return;

            const rect = this.canvas.getBoundingClientRect();

            this.pointer = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };

            this.draw();
        };

        this.canvas.addEventListener("pointerdown", this.down);
        this.canvas.addEventListener("pointermove", this.move);

        this.draw();
    },

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.width = rect.width;
        this.height = rect.height;
    },

    draw() {
        const ctx = this.ctx;
        const width = this.width;
        const height = this.height;

        ctx.clearRect(0, 0, width, height);

        this.connections.forEach(connection => {
            ctx.beginPath();
            ctx.moveTo(connection.a.x, connection.a.y);
            ctx.lineTo(connection.b.x, connection.b.y);
            ctx.strokeStyle = connection.color;
            ctx.lineWidth = 7;
            ctx.stroke();
        });

        if (this.selected && this.pointer) {
            ctx.beginPath();
            ctx.moveTo(this.selected.x, this.selected.y);
            ctx.lineTo(this.pointer.x, this.pointer.y);
            ctx.strokeStyle = this.selected.color;
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        this.points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 17, 0, Math.PI * 2);
            ctx.fillStyle = point.color;
            ctx.fill();

            ctx.lineWidth = point === this.selected ? 5 : 2;
            ctx.strokeStyle = "white";
            ctx.stroke();

            if (point.connected) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
            }
        });
    },

    cleanup() {
        if (this.canvas && this.down) {
            this.canvas.removeEventListener("pointerdown", this.down);
        }

        if (this.canvas && this.move) {
            this.canvas.removeEventListener("pointermove", this.move);
        }

        this.points = [];
        this.connections = [];
        this.selected = null;
        this.active = false;
        this.container = null;
        this.canvas = null;
        this.ctx = null;
    }
};
