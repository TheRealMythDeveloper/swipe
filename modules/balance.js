
const Balance = {
    frame: null,

    cleanup() {
        cancelAnimationFrame(this.frame);
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        container.innerHTML = "";

        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:none;cursor:none;";
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        let width, height;
        let mouse = { x: -1000, y: -1000 };
        let progress = 0;
        let lastTime = 0;
        let finished = false;
        let angle = 0;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };

        resize();

        const move = event => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };

        canvas.addEventListener("pointermove", move);

        const draw = time => {
            if (finished) return;

            const delta = Math.min((time - (lastTime || time)) / 1000, 0.05);
            lastTime = time;
            angle += delta * (0.9 + difficulty * 0.45);

            const x = width / 2 + Math.cos(angle) * width * 0.27;
            const y = height / 2 + Math.sin(angle * 1.35) * height * 0.25;
            const distance = Math.hypot(mouse.x - x, mouse.y - y);

            if (distance < 65) {
                progress += delta;
            } else {
                progress = Math.max(0, progress - delta * 0.65);
            }

            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = "#454c59";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 65, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#55d6be";
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`HOLD POSITION: ${Math.floor(progress / 3 * 100)}%`, width / 2, 35);

            ctx.fillStyle = "#303642";
            ctx.fillRect(width * 0.2, height - 35, width * 0.6, 9);
            ctx.fillStyle = "#55d6be";
            ctx.fillRect(width * 0.2, height - 35, width * 0.6 * Math.min(progress / 3, 1), 9);

            if (progress >= 3) {
                finished = true;
                onComplete(true);
                return;
            }

            this.frame = requestAnimationFrame(draw);
        };

        this.frame = requestAnimationFrame(draw);

        this.cleanup = () => {
            cancelAnimationFrame(this.frame);
            canvas.removeEventListener("pointermove", move);
        };
    }
};
