const Memory = {
    timeouts: [],

    cleanup() {
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
    },

    start(container, onComplete, difficulty = 1) {
        this.cleanup();
        container.innerHTML = "";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";

        const sequence = [];
        const length = 3 + difficulty;
        let inputIndex = 0;
        let accepting = false;
        let finished = false;

        const board = document.createElement("div");
        board.style.cssText = "width:min(70vw,500px);height:min(65vh,420px);display:grid;grid-template-columns:1fr 1fr;gap:12px;";
        container.appendChild(board);

        const pads = [];

        for (let i = 0; i < 4; i++) {
            const pad = document.createElement("button");
            pad.type = "button";
            pad.textContent = String(i + 1);
            pad.style.cssText = "border:2px solid #444b58;background:#20242d;color:white;font-size:32px;cursor:pointer;border-radius:8px;";

            pad.addEventListener("pointerdown", () => {
                if (!accepting || finished) return;

                if (sequence[inputIndex] !== i) {
                    accepting = false;
                    pad.style.background = "#9e3434";
                    this.timeouts.push(setTimeout(() => {
                        onComplete(false);
                    }, 250));
                    return;
                }

                pad.style.background = "#55d6be";
                this.timeouts.push(setTimeout(() => {
                    pad.style.background = "#20242d";
                }, 180));

                inputIndex++;

                if (inputIndex === sequence.length) {
                    finished = true;
                    accepting = false;
                    onComplete(true);
                }
            });

            board.appendChild(pad);
            pads.push(pad);
        }

        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 4));
        }

        const showStep = index => {
            if (index >= sequence.length) {
                this.timeouts.push(setTimeout(() => {
                    accepting = true;
                }, 400));
                return;
            }

            const pad = pads[sequence[index]];
            pad.style.background = "#55d6be";

            this.timeouts.push(setTimeout(() => {
                pad.style.background = "#20242d";

                this.timeouts.push(setTimeout(() => {
                    showStep(index + 1);
                }, 220));
            }, 450));
        };

        this.timeouts.push(setTimeout(() => showStep(0), 600));
    }
};
