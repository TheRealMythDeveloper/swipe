const Sort = {
    container: null,
    onComplete: null,
    objects: [],
    hits: 0,
    required: 6,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.hits = 0;
        this.required = 6 + Math.floor(difficulty);
        this.active = true;
        this.objects = [];

        container.innerHTML = `
            <div style="position:relative;width:100%;height:100%;color:white">
                <div style="position:absolute;top:10px;left:0;width:100%;text-align:center;color:#54d6e8" class="sort-score">SORTED: 0 / ${this.required}</div>
                <div style="position:absolute;bottom:15px;left:5%;width:40%;height:25%;border:2px solid #54d6e8;border-radius:10px;display:grid;place-items:center;color:#54d6e8" data-zone="blue">BLUE</div>
                <div style="position:absolute;bottom:15px;right:5%;width:40%;height:25%;border:2px solid #ff4268;border-radius:10px;display:grid;place-items:center;color:#ff4268" data-zone="red">RED</div>
                <div class="sort-items"></div>
            </div>
        `;

        this.layer = container.querySelector(".sort-items");
        this.spawn();
    },

    spawn() {
        if (!this.active) return;

        const color = Math.random() < 0.5 ? "blue" : "red";
        const object = document.createElement("div");

        Object.assign(object.style, {
            position: "absolute",
            left: `${20 + Math.random() * 60}%`,
            top: `${25 + Math.random() * 25}%`,
            width: "45px",
            height: "45px",
            borderRadius: "8px",
            background: color === "blue" ? "#54d6e8" : "#ff4268",
            cursor: "grab",
            touchAction: "none"
        });

        this.layer.appendChild(object);

        let offsetX = 0;
        let offsetY = 0;
        let dragging = false;

        const down = event => {
            dragging = true;
            const rect = object.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            object.setPointerCapture(event.pointerId);
        };

        const move = event => {
            if (!dragging) return;

            const rect = this.container.getBoundingClientRect();
            object.style.left = `${event.clientX - rect.left - offsetX}px`;
            object.style.top = `${event.clientY - rect.top - offsetY}px`;
        };

        const up = () => {
            if (!dragging) return;
            dragging = false;

            const rect = object.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const zones = [...this.container.querySelectorAll("[data-zone]")];

            const zone = zones.find(item => {
                const r = item.getBoundingClientRect();
                return centerX >= r.left && centerX <= r.right &&
                    centerY >= r.top && centerY <= r.bottom;
            });

            if (zone) {
                if (zone.dataset.zone === color) {
                    this.hits++;
                    object.remove();
                    this.container.querySelector(".sort-score").textContent =
                        `SORTED: ${this.hits} / ${this.required}`;

                    if (this.hits >= this.required) {
                        this.active = false;
                        this.onComplete?.();
                    } else {
                        this.spawn();
                    }
                } else {
                    object.style.left = "50%";
                    object.style.top = "35%";
                }
            }
        };

        object.addEventListener("pointerdown", down);
        object.addEventListener("pointermove", move);
        object.addEventListener("pointerup", up);

        this.objects.push({
            element: object,
            cleanup: () => {
                object.removeEventListener("pointerdown", down);
                object.removeEventListener("pointermove", move);
                object.removeEventListener("pointerup", up);
            }
        });
    },

    cleanup() {
        this.active = false;
        this.objects.forEach(item => {
            item.cleanup();
            item.element.remove();
        });
        this.objects = [];
        this.container = null;
    }
};