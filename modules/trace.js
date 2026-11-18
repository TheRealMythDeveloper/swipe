
const Trace = {
    container: null,
    canvas: null,
    ctx: null,
    onComplete: null,
    active: false,
    path: [],
    visited: [],
    progress: null,
    message: null,
    drawing: false,
    lastPoint: null,
    width: 0,
    height: 0,
    required: 0.75,

    start(container, onComplete) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.active = true;
        this.drawing = false;
        this.lastPoint = null;
        this.required = 0.75;

        container.innerHTML = `
            <div style="position:absolute;inset:0;background:#11151e;color:white;overflow:hidden">
                <div style="position:absolute;top:14px;width:100%;text-align:center;z-index:3;pointer-events:none">
                    <h2 style="color:#54d6e8;letter-spacing:4px">TRACE</h2>
                    <p>Follow the route from START to FINISH</p>
                    <p class="trace-progress" style="margin-top:8px">0%</p>
                </div>
                <canvas class="trace-canvas" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none"></canvas>
                <p class="trace-message" style="position:absolute;bottom:5%;width:100%;text-align:center;color:#aeb5c5;pointer-events:none">PRESS START AND FOLLOW THE LINE</p>
            </div>
        `;

        this.canvas = container.querySelector(".trace-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.progress = container.querySelector(".trace-progress");
        this.message = container.querySelector(".trace-message");

        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const w = this.width;
        const h = this.height;

        const normalized = [
            [0.12, 0.65],
            [0.22, 0.40],
            [0.35, 0.30],
            [0.48, 0.55],
            [0.60, 0.72],
            [0.73, 0.48],
            [0.84, 0.32]
        ];

        this.path = normalized.map(([x, y]) => ({
            x: x * w,
            y: y * h
        }));

        this.visited = new Array(this.path.length - 1).fill(false);

        this.draw();

        this.down = event => {
            if (!this.active || this.drawing) return;

            const point = this.getPoint(event);
            const start = this.path[0];

            if (Math.hypot(point.x - start.x, point.y - start.y) > 65) {
                this.message.textContent = "START AT THE GREEN CIRCLE";
                return;
            }

            this.drawing = true;
            this.lastPoint = point;
            this.message.textContent = "KEEP FOLLOWING THE ROUTE";
            this.markProgress(point);
            this.draw();
        };

        this.move = event => {
            if (!this.active || !this.drawing) return;

            const point = this.getPoint(event);
            this.markProgress(point);
            this.lastPoint = point;
            this.draw();
        };

        this.up = () => {
            this.drawing = false;
            this.lastPoint = null;
        };

        this.canvas.addEventListener("pointerdown", this.down);
        this.canvas.addEventListener("pointermove", this.move);
        this.canvas.addEventListener("pointerup", this.up);
        this.canvas.addEventListener("pointercancel", this.up);
    },

    getPoint(event) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    },

    markProgress(point) {
        for (let i = 0; i < this.path.length - 1; i++) {
            const a = this.path[i];
            const b = this.path[i + 1];

            if (this.distanceToSegment(point, a, b) < 48) {
                this.visited[i] = true;
            }
        }

        const completed = this.visited.filter(Boolean).length;
        const percent = completed / this.visited.length;
        this.progress.textContent = `${Math.floor(percent * 100)}%`;

        if (percent >= this.required) {
            this.finish(true);
        }
    },

    distanceToSegment(point, a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = dx * dx + dy * dy;

        if (!length) {
            return Math.hypot(point.x - a.x, point.y - a.y);
        }

        const t = Math.max(0, Math.min(1,
            ((point.x - a.x) * dx + (point.y - a.y) * dy) / length
        ));

        return Math.hypot(
            point.x - (a.x + t * dx),
            point.y - (a.y + t * dy)
        );
    },

    draw() {
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.path.length - 1; i++) {
            const a = this.path[i];
            const b = this.path[i + 1];

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 19;
            ctx.lineCap = "round";
            ctx.strokeStyle = this.visited[i] ? "#35c978" : "#343b4b";
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#aeb5c5";
            ctx.setLineDash([7, 9]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const start = this.path[0];
        const end = this.path[this.path.length - 1];

        ctx.beginPath();
        ctx.arc(start.x, start.y, 23, 0, Math.PI * 2);
        ctx.fillStyle = "#35c978";
        ctx.fill();
        ctx.fillStyle = "#11151e";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GO", start.x, start.y);

        ctx.beginPath();
        ctx.arc(end.x, end.y, 23, 0, Math.PI * 2);
        ctx.fillStyle = "#54d6e8";
        ctx.fill();
        ctx.fillStyle = "#11151e";
        ctx.fillText("END", end.x, end.y);

        if (this.lastPoint && this.drawing) {
            ctx.beginPath();
            ctx.arc(this.lastPoint.x, this.lastPoint.y, 9, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
        }
    },

    finish(success) {
        if (!this.active) return;
        this.active = false;
        this.message.textContent = "ROUTE COMPLETE";
        this.onComplete?.(success);
    },

    cleanup() {
        this.active = false;

        if (this.canvas) {
            this.canvas.removeEventListener("pointerdown", this.down);
            this.canvas.removeEventListener("pointermove", this.move);
            this.canvas.removeEventListener("pointerup", this.up);
            this.canvas.removeEventListener("pointercancel", this.up);
        }

        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.path = [];
        this.visited = [];
    }
};
