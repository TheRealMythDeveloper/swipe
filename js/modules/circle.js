const Circle = {
    container: null,
    onComplete: null,
    points: [],
    drawing: false,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.points = [];
        this.drawing = false;
        this.active = true;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;display:grid;place-items:center;color:#54d6e8">
                <div style="position:absolute;width:180px;height:180px;border:3px dashed #54d6e8;border-radius:50%;opacity:.5"></div>
                <canvas class="circle-canvas" style="position:absolute;width:100%;height:100%;touch-action:none"></canvas>
                <div style="position:absolute;bottom:15px">DRAW A CIRCLE</div>
            </div>
        `;

        this.canvas = container.querySelector(".circle-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.resize();

        this.down = event => {
            if (!this.active) return;
            this.drawing = true;
            this.points = [];
            this.addPoint(event);
        };

        this.move = event => {
            if (!this.drawing || !this.active) return;
            this.addPoint(event);
            this.draw();
        };

        this.up = () => {
            if (!this.drawing) return;
            this.drawing = false;
            this.checkCircle();
        };

        this.canvas.addEventListener("pointerdown", this.down);
        this.canvas.addEventListener("pointermove", this.move);
        this.canvas.addEventListener("pointerup", this.up);
        this.canvas.addEventListener("pointercancel", this.up);
    },

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    },

    addPoint(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.points.push({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        });
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (const point of this.points.slice(1)) {
            this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.strokeStyle = "#54d6e8";
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = "round";
        this.ctx.stroke();
    },

    checkCircle() {
        if (this.points.length < 20) return;

        const first = this.points[0];
        const last = this.points[this.points.length - 1];
        const closure = Math.hypot(first.x - last.x, first.y - last.y);

        const centerX = this.points.reduce((sum, p) => sum + p.x, 0) / this.points.length;
        const centerY = this.points.reduce((sum, p) => sum + p.y, 0) / this.points.length;

        const radii = this.points.map(p =>
            Math.hypot(p.x - centerX, p.y - centerY)
        );

        const average = radii.reduce((a, b) => a + b, 0) / radii.length;

        const variance = radii.reduce(
            (sum, r) => sum + Math.abs(r - average), 0
        ) / radii.length;

        if (closure < average * 0.35 && variance < average * 0.3) {
            this.active = false;
            this.onComplete?.();
        } else {
            this.points = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    cleanup() {
        if (this.canvas) {
            this.canvas.removeEventListener("pointerdown", this.down);
            this.canvas.removeEventListener("pointermove", this.move);
            this.canvas.removeEventListener("pointerup", this.up);
            this.canvas.removeEventListener("pointercancel", this.up);
        }

        this.points = [];
        this.drawing = false;
        this.active = false;
        this.container = null;
        this.canvas = null;
    }
};