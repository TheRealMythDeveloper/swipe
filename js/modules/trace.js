
const Trace = {
    container: null,
    onComplete: null,
    active: false,
    progress: 0,
    required: 12,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.active = false;
        this.progress = 0;
        this.required = 12 + Math.floor(difficulty) * 2;

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%">
                <div style="
                    position:absolute;
                    left:10%;
                    top:45%;
                    width:80%;
                    height:10px;
                    border-radius:10px;
                    background:#353b4b;
                "></div>
                <div style="
                    position:absolute;
                    left:10%;
                    top:45%;
                    width:80%;
                    height:10px;
                    background:#54d6e8;
                    opacity:.25;
                "></div>
                <div style="
                    position:absolute;
                    left:8%;
                    top:calc(45% - 12px);
                    width:24px;
                    height:34px;
                    background:#54d6e8;
                    border-radius:5px;
                "></div>
                <div style="
                    position:absolute;
                    right:8%;
                    top:calc(45% - 12px);
                    width:24px;
                    height:34px;
                    background:#54d6e8;
                    border-radius:5px;
                "></div>
                <div class="trace-progress" style="
                    position:absolute;
                    bottom:15%;
                    width:100%;
                    text-align:center;
                    color:#54d6e8;
                ">FOLLOW THE PATH</div>
            </div>
        `;

        this.path = container.querySelector("div");
        this.progressLabel = container.querySelector(".trace-progress");

        this.down = event => {
            const rect = this.path.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x < rect.width * 0.08 || x > rect.width * 0.92) return;
            if (Math.abs(y - rect.height * 0.5) > 30) return;

            this.active = true;
        };

        this.move = event => {
            if (!this.active) return;

            const rect = this.path.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (Math.abs(y - rect.height * 0.5) > 30 ||
                x < 0 || x > rect.width) {
                this.active = false;
                this.progress = 0;
                this.update();
                return;
            }

            this.progress = Math.max(
                this.progress,
                Math.min(1, x / rect.width)
            );

            this.update();

            if (this.progress >= 0.9) {
                this.onComplete?.();
                this.active = false;
            }
        };

        container.addEventListener("pointerdown", this.down);
        container.addEventListener("pointermove", this.move);
        container.addEventListener("pointerup", () => this.active = false);
    },

    update() {
        this.progressLabel.textContent =
            `PROGRESS: ${Math.floor(this.progress * 100)}%`;
    },

    cleanup() {
        if (this.container && this.down) {
            this.container.removeEventListener("pointerdown", this.down);
            this.container.removeEventListener("pointermove", this.move);
        }
        this.container = null;
        this.active = false;
    }
};
