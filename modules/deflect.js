const Deflect = {
    container: null,
    onComplete: null,
    objects: [],
    interval: null,
    hits: 0,
    required: 5,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 5 + Math.floor(difficulty);
        this.active = true;
        this.objects = [];

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;overflow:hidden;color:#54d6e8">
                <div style="position:absolute;right:0;top:35%;height:30%;width:12%;background:#54d6e855;border-left:3px solid #54d6e8;display:grid;place-items:center">GOAL</div>
                <div class="deflect-score" style="position:absolute;top:15px;left:0;width:100%;text-align:center">SCORE: 0 / ${this.required}</div>
                <div class="deflect-field" style="position:absolute;inset:0"></div>
            </div>
        `;

        this.field = container.querySelector(".deflect-field");

        this.spawn();

        this.interval = setInterval(() => {
            if (this.active) this.spawn();
        }, Math.max(650, 1400 - difficulty * 100));
    },

    spawn() {
        const object = document.createElement("div");

        Object.assign(object.style, {
            position: "absolute",
            left: "10%",
            top: `${20 + Math.random() * 60}%`,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#ff4268",
            cursor: "pointer",
            touchAction: "none"
        });

        this.field.appendChild(object);

        const record = {
            element: object,
            x: 10,
            y: parseFloat(object.style.top),
            vx: 0,
            vy: 0
        };

        this.objects.push(record);

        const launch = event => {
            const rect = object.getBoundingClientRect();
            const dx = event.clientX - (rect.left + rect.width / 2);
            const dy = event.clientY - (rect.top + rect.height / 2);

            record.vx = Math.max(1, Math.min(12, dx / 15));
            record.vy = Math.max(-8, Math.min(8, dy / 15));

            object.removeEventListener("pointerdown", launch);
        };

        object.addEventListener("pointerdown", launch);

        record.interval = setInterval(() => {
            if (!this.active) return;

            record.x += record.vx;
            record.y += record.vy;

            object.style.left = `${record.x}%`;
            object.style.top = `${record.y}%`;

            if (record.x >= 85) {
                if (record.y >= 35 && record.y <= 65 && record.vx > 0) {
                    this.hits++;
                    this.container.querySelector(".deflect-score").textContent =
                        `SCORE: ${this.hits} / ${this.required}`;

                    if (this.hits >= this.required) {
                        this.active = false;
                        this.onComplete?.();
                    }
                }

                this.removeObject(record);
            }

            if (record.x > 100 || record.y < 0 || record.y > 100) {
                this.removeObject(record);
            }
        }, 50);
    },

    removeObject(record) {
        clearInterval(record.interval);
        record.element.remove();
        this.objects = this.objects.filter(item => item !== record);
    },

    cleanup() {
        clearInterval(this.interval);
        this.objects.forEach(item => {
            clearInterval(item.interval);
            item.element.remove();
        });

        this.objects = [];
        this.active = false;
        this.container = null;
    }
};