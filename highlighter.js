const highlightColor = "#fff600";

const createButton = document.createElement('button')
createButton.innerText = 'Undo'

const template = `
  <template id="highlightTemplate">
    <span class="highlight" style="background-color: ${highlightColor}; display: inline"></span>
  </template>

  <button id="sampleHighlighter">
      <p class="text-marker">getText</p>
  </button>
`;

const styled = ({ display = "none", left = 0, top = 0 }) => `
  #sampleHighlighter {
    background-color: #808080;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    display: ${display};
    left: ${left}px;
    position: fixed;
    top: ${top}px;
    z-index: 9999;
  }
  .text-marker {
    fill: white;
    padding:5px;
    margin:0px;
    color:#fff;
  }
  .text-marker:hover {
    fill: ${highlightColor};
  }
`;


class Highlighter extends HTMLElement {
    stack = []
    specific_range = []
    total_stack = 0
    constructor() {
        super();
        this.render();
    }

    get markerPosition() {
        return JSON.parse(this.getAttribute("markerPosition") || "{}");
    }

    get styleElement() {
        return this.shadowRoot.querySelector("style");
    }

    get highlightTemplate() {
        return this.shadowRoot.getElementById("highlightTemplate");
    }

    static get observedAttributes() {
        return ["markerPosition"];
    }

    render() {
        document.body.appendChild(createButton)
            .addEventListener("click", () => this.removeHighlight());
        this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.textContent = styled({});
        this.shadowRoot.appendChild(style);
        this.shadowRoot.innerHTML += template;
        this.shadowRoot
            .getElementById("sampleHighlighter")
            .addEventListener("click", () => this.highlightSelection());
    }


    removeHighlight() {
        if (this.total_stack > 0) {
            const current_position_stack = this.total_stack - 1
            console.log('undo')
            this.stack[current_position_stack].style.backgroundColor = '#fff'
            this.specific_range[current_position_stack].insertNode(this.stack[current_position_stack])
            this.total_stack = this.total_stack - 1
            this.stack.pop();
            this.specific_range.pop();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "markerPosition") {
            this.styleElement.textContent = styled(this.markerPosition);
        }
    }

    highlightSelection() {
        var userSelection = window.getSelection();
        for (let i = 0; i < userSelection.rangeCount; i++) {
            this.highlightRange(userSelection.getRangeAt(i));
        }
        alert(userSelection)
        window.getSelection().empty();
    }

    highlightRange(range) {
        const clone =
            this.highlightTemplate.cloneNode(true).content.firstElementChild;
        clone.appendChild(range.extractContents());
        range.insertNode(clone);
        this.specific_range.push(range)
        this.stack.push(clone)
        this.total_stack = this.total_stack + 1
    }
}

window.customElements.define("sample-highlighter", Highlighter);
