
const Tap = {
    timeout: null,
    target: null,
    container: null,
    active: false,

    cleanup() {
        clearTimeout(this.timeout);

        if (this.target) {
            this.target.remove();
            this.target = null;
        }

        this.active = false;
        this.container = null;
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.active = true;

        container.innerHTML = "";
        container.style.position = "relative";
        container.style.overflow = "hidden";

        let hits = 0;
        let finished = false;
        let lastPosition = null;

        const required = 9 + difficulty * 2;
        const size = Math.max(64, 82 - difficulty * 2);
        const lifespan = Math.max(1100, 2200 - difficulty * 180);
        const delay = Math.max(100, 280 - difficulty * 30);

        const label = document.createElement("div");

        label.style.cssText = `
            position:absolute;
            top:14px;
            left:50%;
            transform:translateX(-50%);
            font-size:18px;
            color:white;
            z-index:2;
            pointer-events:none;
        `;

        label.textContent = `TARGETS: 0 / ${required}`;
        container.appendChild(label);

        const spawn = () => {
            if (!this.active || finished) return;

            if (this.target) {
                this.target.remove();
                this.target = null;
            }

            const target = document.createElement("button");

            target.type = "button";
            target.textContent = "+";

            target.style.cssText = `
                position:absolute;
                width:${size}px;
                height:${size}px;
                border:2px solid #55d6be;
                border-radius:50%;
                background:#182c32;
                color:#55d6be;
                font-size:30px;
                font-weight:bold;
                cursor:pointer;
                touch-action:manipulation;
                transform:translate(-50%,-50%);
            `;

            const maxX = Math.max(size / 2 + 8, container.clientWidth - size / 2 - 8);
            const minX = size / 2 + 8;

            const maxY = Math.max(size / 2 + 55, container.clientHeight - size / 2 - 8);
            const minY = size / 2 + 55;

            let x;
            let y;

            // Avoid repeatedly placing the target in almost the same spot.
            for (let i = 0; i < 8; i++) {
                x = minX + Math.random() * Math.max(1, maxX - minX);
                y = minY + Math.random() * Math.max(1, maxY - minY);

                if (!lastPosition ||
                    Math.hypot(x - lastPosition.x, y - lastPosition.y) > 120) {
                    break;
                }
            }

            lastPosition = { x, y };

            target.style.left = `${x}px`;
            target.style.top = `${y}px`;

            this.target = target;
            container.appendChild(target);

            target.onclick = () => {
                if (!this.active || finished || this.target !== target) return;

                clearTimeout(this.timeout);
                hits++;

                label.textContent = `TARGETS: ${hits} / ${required}`;

                target.remove();
                this.target = null;

                if (hits >= required) {
                    finished = true;
                    this.active = false;
                    onComplete(true);
                    return;
                }

                this.timeout = setTimeout(spawn, delay);
            };

            this.timeout = setTimeout(() => {
                if (!this.active || finished || this.target !== target) return;

                target.remove();
                this.target = null;
                spawn();
            }, lifespan);
        };

        spawn();
    }
};
