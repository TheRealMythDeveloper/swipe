
const Sort = {
    container: null,
    onComplete: null,
    items: [],
    selected: null,
    placed: 0,
    active: false,

    start(container, onComplete, difficulty = 1) {
        this.cleanup();

        this.container = container;
        this.onComplete = onComplete;
        this.placed = 0;
        this.selected = null;
        this.active = true;

        const colors = [
            { name: "CYAN", color: "#54d6e8" },
            { name: "GREEN", color: "#35c978" },
            { name: "RED", color: "#ed6262" },
            { name: "YELLOW", color: "#e9ca57" }
        ];

        this.items = [...colors].sort(() => Math.random() - 0.5);

        container.innerHTML = `
            <div style="width:100%;min-height:350px;background:#171a24;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:25px;padding:20px;box-sizing:border-box">
                <h2 style="color:#54d6e8">SORT THE OBJECTS</h2>
                <p>Select an object, then select its matching zone.</p>
                <div class="sort-items" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"></div>
                <div class="sort-zones" style="display:grid;grid-template-columns:repeat(2,minmax(90px,130px));gap:12px"></div>
                <p class="sort-progress">SORTED: 0 / 4</p>
            </div>
        `;

        const itemArea = container.querySelector(".sort-items");
        const zoneArea = container.querySelector(".sort-zones");

        this.items.forEach(item => {
            const button = document.createElement("button");

            button.textContent = item.name;
            button.dataset.color = item.name;
            button.style.cssText = `
                width:85px;
                height:65px;
                border:2px solid ${item.color};
                background:#252b38;
                color:${item.color};
                font-weight:bold;
                cursor:pointer;
                border-radius:5px;
            `;

            button.addEventListener("click", () => {
                if (!this.active || button.dataset.placed) return;

                if (this.selected) {
                    this.selected.style.outline = "none";
                }

                this.selected = button;
                button.style.outline = "3px solid white";
            });

            itemArea.appendChild(button);
        });

        colors.forEach(item => {
            const zone = document.createElement("button");

            zone.textContent = item.name;
            zone.dataset.color = item.name;
            zone.style.cssText = `
                min-height:75px;
                border:2px dashed ${item.color};
                background:#252b38;
                color:${item.color};
                font-weight:bold;
                cursor:pointer;
                border-radius:5px;
            `;

            zone.addEventListener("click", () => {
                if (!this.active || !this.selected) return;

                if (this.selected.dataset.color !== zone.dataset.color) {
                    zone.textContent = "WRONG ZONE";
                    setTimeout(() => {
                        if (this.active) zone.textContent = item.name;
                    }, 450);
                    return;
                }

                this.selected.dataset.placed = "true";
                this.selected.style.visibility = "hidden";
                this.selected.style.outline = "none";

                zone.textContent = "✓ " + item.name;
                zone.style.background = "#263c35";
                zone.style.borderStyle = "solid";

                this.selected = null;
                this.placed++;

                container.querySelector(".sort-progress").textContent =
                    `SORTED: ${this.placed} / 4`;

                if (this.placed >= 4) {
                    this.active = false;
                    this.onComplete?.(true);
                }
            });

            zoneArea.appendChild(zone);
        });
    },

    cleanup() {
        this.active = false;
        this.selected = null;
        this.items = [];
        this.placed = 0;
        this.container = null;
    }
};
