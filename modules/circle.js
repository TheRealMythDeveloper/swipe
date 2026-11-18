
const Circle = {
    frame: null,
    cleanup() {
        cancelAnimationFrame(this.frame);
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        container.innerHTML = "";

        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:none;cursor:crosshair;";
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        let width, height;
        let drawing = false;
        let points = [];
        let completed = false;
        let guideAngle = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };

        resize();

        const center = () => ({
            x: width / 2,
            y: height / 2
        });

        const radius = () => Math.min(width, height) * 0.25;

        const position = event => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            const c = center();
            const r = radius();

            ctx.strokeStyle = "#555b69";
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 9]);
            ctx.beginPath();
            ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            const guideX = c.x + Math.cos(guideAngle) * r;
            const guideY = c.y + Math.sin(guideAngle) * r;

            ctx.fillStyle = "#55d6be";
            ctx.beginPath();
            ctx.arc(guideX, guideY, 7, 0, Math.PI * 2);
            ctx.fill();

            if (points.length > 1) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);

                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }

                ctx.stroke();
            }

            guideAngle += 0.025 + difficulty * 0.006;
            this.frame = requestAnimationFrame(draw);
        };

        const down = event => {
            const p = position(event);
            const c = center();

            if (Math.hypot(p.x - c.x, p.y - c.y) > radius() * 1.7) return;

            drawing = true;
            points = [p];
            canvas.setPointerCapture(event.pointerId);
        };

        const move = event => {
            if (!drawing) return;
            points.push(position(event));
        };

        const up = () => {
            if (!drawing || completed) return;
            drawing = false;

            if (points.length < 30) {
                points = [];
                return;
            }

            const c = center();
            const distances = points.map(p =>
                Math.hypot(p.x - c.x, p.y - c.y)
            );

            const average = distances.reduce((a, b) => a + b, 0) / distances.length;
            const variation = distances.reduce((a, b) => a + Math.abs(b - average), 0) / distances.length;
            const coverage = Math.abs(points[points.length - 1].x - points[0].x) +
                Math.abs(points[points.length - 1].y - points[0].y);

            const accuracy = variation / Math.max(average, 1);

            if (accuracy < 0.19 && coverage < radius() * 1.1) {
                completed = true;
                onComplete(true);
            } else {
                points = [];
            }
        };

        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);

        draw();

        this.cleanup = () => {
            cancelAnimationFrame(this.frame);
            canvas.removeEventListener("pointerdown", down);
            canvas.removeEventListener("pointermove", move);
            canvas.removeEventListener("pointerup", up);
            canvas.removeEventListener("pointercancel", up);
        };
    }
};
