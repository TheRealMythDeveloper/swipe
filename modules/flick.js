const Flick = {
    container: null,
    onComplete: null,
    hits: 0,
    required: 4,
    active: false,
    objects: [],

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 4 + Math.floor(difficulty);
        this.active = true;
        this.objects = [];

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;overflow:hidden;color:#54d6e8">
                <div style="position:absolute;right:5%;top:35%;width:22%;height:30%;border:3px dashed #54d6e8;border-radius:12px;display:grid;place-items:center">TARGET</div>
                <div class="flick-score" style="position:absolute;top:15px;width:100%;text-align:center">HITS: 0 / ${this.required}</div>
                <div class="flick-object" style="position:absolute;left:12%;top:45%;width:45px;height:45px;background:#ff4268;border-radius:50%;touch-action:none"></div>
            </div>
        `;

        this.object = container.querySelector(".flick-object");
        this.scoreElement = container.querySelector(".flick-score");

        this.down = event => {
            if (!this.active) return;
            this.startPoint = { x: event.clientX, y: event.clientY };
            this.object.setPointerCapture(event.pointerId);
        };

        this.up = event => {
            if (!this.startPoint || !this.active) return;

            const dx = event.clientX - this.startPoint.x;
            const dy = event.clientY - this.startPoint.y;
            this.startPoint = null;

            if (Math.hypot(dx, dy) < 35) return;

            const rect = this.container.getBoundingClientRect();
            const target = {
                left: rect.width * 0.78,
                right: rect.width * 0.98,
                top: rect.height * 0.35,
                bottom: rect.height * 0.65
            };

            const objectRect = this.object.getBoundingClientRect();
            let x = objectRect.left - rect.left + dx;
            let y = objectRect.top - rect.top + dy;

            const centerX = x + objectRect.width / 2;
            const centerY = y + objectRect.height / 2;

            if (
                centerX >= target.left &&
                centerX <= target.right &&
                centerY >= target.top &&
                centerY <= target.bottom &&
                dx > 0
            ) {
                this.hits++;
                this.scoreElement.textContent =
                    `HITS: ${this.hits} / ${this.required}`;

                if (this.hits >= this.required) {
                    this.active = false;
                    this.onComplete?.();
                    return;
                }
            }

            this.object.style.left = "12%";
            this.object.style.top = "45%";
        };

        container.addEventListener("pointerdown", this.down);
        window.addEventListener("pointerup", this.up);
    },

    cleanup() {
        if (this.container) {
            this.container.removeEventListener("pointerdown", this.down);
        }
        if (this.up) window.removeEventListener("pointerup", this.up);
        this.container = null;
        this.startPoint = null;
        this.active = false;
    }
};