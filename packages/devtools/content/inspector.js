const CSS = `
    .inspector-overlay {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999999;
        width: 100vh;
        height: 100vh;
        pointer-events: none;
        box-sizing: border-box;
    }

    .inspector-overlay-element {
        position: absolute;
        background: rgba(0, 144, 255, 0.5);
    }

    .inspector-overlay-element::before {
        position: absolute;
        top: -200vh;
        bottom: -200vh;
        display: block;
        margin: auto;
        width: 100%;
        height: 200vh;
        content: '';
        border-left: solid 1px #ccc;
        border-right: solid 1px #ccc;
        box-sizing: border-box;
    }

    .inspector-overlay-element::after {
        position: absolute;
        left: -200vh;
        right: -200vh;
        display: block;
        margin: auto;
        width: 200vw;
        height: 100%;
        content: '';
        border-top: solid 1px #ccc;
        border-bottom: solid 1px #ccc;
        box-sizing: border-box;
    }
`;

class Inspector {
    constructor(root = document.body) {
        this.root = root;
        this.overlay = document.createElement('div');
        this.overlay.className = 'inspector-overlay';
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'inspector-overlay-element';
        let style = document.createElement('style');
        style.textContent = CSS;
        this.overlay.appendChild(style);
        this.overlay.appendChild(this.overlayElement);
    }

    inspect(element) {
        try {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }

            element.scrollIntoView({
                behavior: 'instant',
                block: 'center',
                inline: 'center',
            });

            let rect = element.getBoundingClientRect();
            if (rect.width || rect.height) {
                this.overlayElement.style.top = `${rect.top}px`;
                this.overlayElement.style.left = `${rect.left}px`;
                this.overlayElement.style.width = `${rect.width}px`;
                this.overlayElement.style.height = `${rect.height}px`;

                if (!this.overlay.parentNode) {
                    this.root.appendChild(this.overlay);
                }
                return;
            }
        } catch (err) {
            //
        }
        this.clear();
    }

    clear() {
        if (this.overlay.parentNode) {
            this.root.removeChild(this.overlay);
        }
    }
}

window.inspector = new Inspector();