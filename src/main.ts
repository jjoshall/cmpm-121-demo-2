import "./style.css";

const APP_NAME = "Drawing & Emoticons";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Create and append the title element
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
// app.appendChild(titleElement);

interface Point {
  x: number;
  y: number;
}

interface ToolPreview {
  setPosition(x: number, y: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

interface Drawable {
  addPoint(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
  setLineWidth(width: number): void;
  getLineWidth(): number;
  setLineColor(color: string): void;
  getLineColor(): string;
}

// Function to create and display the drawing keeping in mind the line width
function createDrawablePath(lineWidth: number, color: string): Drawable {
  const points: Point[] = [];
  let currentLineWidth = lineWidth;
  let currentLineColor = color;

  const addPoint = (x: number, y: number) => {
    points.push({ x, y });
  };

  const display = (ctx: CanvasRenderingContext2D) => {
    if (points.length === 0) 
      return;
    ctx.lineWidth = currentLineWidth;
    ctx.strokeStyle = currentLineColor;  
    ctx.beginPath();  // new path to begin drawing 
    ctx.moveTo(points[0].x, points[0].y);  // first point in the path
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y); 
    });
    ctx.stroke();
  };

  const setLineWidth = (width: number) => {
    currentLineWidth = width;
  };

  const getLineWidth = () => currentLineWidth;

  const setLineColor = (color: string) => {
    currentLineColor = color;
  };

  const getLineColor = () => currentLineColor;

  return {
    addPoint,
    display,
    setLineWidth,
    getLineWidth,
    setLineColor,
    getLineColor,
  };
}

function createDrawableEmoji(emoji: string): Drawable {
  const points: Point[] = [];
  const currentEmoji = emoji;

  const addPoint = (x: number, y: number) => {
    points.push({ x, y });
  };

  const display = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "28px serif";
    points.forEach((point) => {
      ctx.fillText(currentEmoji, point.x, point.y);
    });
  };

  const setLineWidth = (_width: number) => {};

  const getLineWidth = () => 0;

  const setLineColor = (_color: string) => {};

  const getLineColor = () => "";

  return {
    addPoint,
    display,
    setLineWidth,
    getLineWidth,
    setLineColor,
    getLineColor,
  };
}

// Function to create a tool preview for which marker tool is selected
function createCircleToolPreview(radius: number): ToolPreview {
  let x = 0;
  let y = 0;

  const setPosition = (newX: number, newY: number) => {
    x = newX;
    y = newY;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    // x, y is the center
    // radius / 2 scales it down
    // 0 is the starting angle
    // 2 * Math.PI completes the circle
    ctx.arc(x, y, radius / 2, 0, 2 * Math.PI);
    ctx.stroke();
  };

  return { setPosition, draw };
}

function createEmojiToolPreview(emoji: string): ToolPreview {
  let x = 0;
  let y = 0;

  const setPosition = (newX: number, newY: number) => {
    x = newX;
    y = newY;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "28px serif";
    ctx.fillText(emoji, x - ctx.measureText(emoji).width / 2, y);
  };

  return { setPosition, draw };
}

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
// app.appendChild(canvas);

const userDrawing = canvas.getContext("2d")!;
let isDrawing = false;
const paths: Drawable[] = [];
let currentPath: Drawable | null = null;
let currentLineWidth = 1;
let currentLineColor = "black";
let currentToolPreview: ToolPreview | null = null;

function createContainer() {
  const container = document.createElement("div");
  container.classList.add("centered-container"); // i put this in style.css instead of having it in main
  return container;
}

// Creating a container for the buttons and setting its style
// Asked Copilot for help on this and it gave this

// moved all styling to style.css
const toolButtonContainer = createContainer();
toolButtonContainer.classList.add("tool-button-container"); 
app.appendChild(toolButtonContainer);

const emojiButtonContainer = createContainer();
emojiButtonContainer.classList.add("emoji-button-container"); 
app.appendChild(emojiButtonContainer);

const canvasContainer = createContainer();
canvasContainer.classList.add("canvas-container"); 
app.appendChild(canvasContainer);

canvasContainer.appendChild(titleElement);
canvasContainer.appendChild(canvas);

// Function to create a tool button
function createToolButton(label: string, lineWidth: number, color: string) {
  const button = document.createElement("button");
  button.className = "selected-tool";
  button.textContent = label;
  button.style.display = "block";
  button.style.margin = "5px 0";
  button.onclick = () => {
    // turn emoji tool off
    currentTool = null;
    currentLineWidth = lineWidth;
    currentLineColor = color;
    userDrawing.lineWidth = currentLineWidth;
    userDrawing.strokeStyle = currentLineColor;
    selectedToolFeedback.textContent = `Pen Style: ${label}`;
    selectedToolFeedback.className = `selected-tool ${label.toLowerCase()}`;
    selectedToolFeedback.style.backgroundColor = color;
  };
  return button;
}

// Creating buttons for 'thin' and 'thick' marker tools and adding them to the container
const thinButton = createToolButton("Thin", 1.75, "black");
const thickButton = createToolButton("Thick", 7, "black");

toolButtonContainer.appendChild(thinButton);
toolButtonContainer.appendChild(thickButton);

// Creating a slider to adjust the color of the marker tool
// Creating a slider to adjust the color of the marker tool
const colorSlider = document.createElement("input");
colorSlider.type = "range";
colorSlider.min = "0";
colorSlider.max = "360";
colorSlider.value = "0";
colorSlider.className = "color-slider"; // Use class for styling

colorSlider.oninput = (e) => {
  const hue = (e.target as HTMLInputElement).value;
  currentLineColor = `hsl(${hue}, 100%, 50%)`;
  userDrawing.strokeStyle = currentLineColor;
  selectedToolFeedback.style.backgroundColor = currentLineColor;
};
toolButtonContainer.appendChild(colorSlider);

// Create an element to display the marker feedback
const selectedToolFeedback = document.createElement("div");
selectedToolFeedback.className = "selected-tool";
selectedToolFeedback.textContent = "Pen Style: None";
toolButtonContainer.appendChild(selectedToolFeedback);

function createEmojiButton(emoji: string) {
  const button = document.createElement("button");
  button.className = "selected-tool";
  button.textContent = emoji;
  button.style.display = "block";
  button.style.margin = "5px 0";
  button.onclick = () => {
    new CustomEvent("tool-moved", { detail: { tool: emoji } });
    currentTool = emoji;
    selectedEmojiFeedback.textContent = `Selected Emoji: ${emoji}`;
    selectedEmojiFeedback.className = `selected-emoji ${emoji.toLowerCase()}`;
  };
  return button;
}

function createNewCustomEmojiButton() {
  const button = document.createElement("button");
  button.className = "selected-tool";
  button.textContent = "Choose Your Own Emoji!";
  button.style.display = "block";
  button.style.margin = "5px 0";
  button.onclick = () => {
    const customEmoji = prompt("Enter your custom emoji");
    if (customEmoji) {
      const newCustomEmojiButton = createNewCustomEmojiButton();
      emojiButtonContainer.insertBefore(newCustomEmojiButton, button);
      button.textContent = customEmoji;
      button.onclick = () => {
        new CustomEvent("tool-moved", { detail: { tool: customEmoji } });
        currentTool = customEmoji;
        selectedEmojiFeedback.textContent = `Selected Emoji: ${customEmoji}`;
        selectedEmojiFeedback.className = `selected-emoji ${customEmoji.toLowerCase()}`;
      };
    }
  };
  return button;
}

const smileyButton = createEmojiButton("😁");
const laughingButton = createEmojiButton("😂");
const cryButton = createEmojiButton("😭");
const customEmojiButton = createNewCustomEmojiButton();

emojiButtonContainer.appendChild(smileyButton);
emojiButtonContainer.appendChild(laughingButton);
emojiButtonContainer.appendChild(cryButton);
emojiButtonContainer.appendChild(customEmojiButton);

const selectedEmojiFeedback = document.createElement("div");
selectedEmojiFeedback.className = "selected-emoji";
selectedEmojiFeedback.textContent = "Selected Emoji: None";
emojiButtonContainer.appendChild(selectedEmojiFeedback);

let currentTool: string | null = null;

function drawEmoji(x: number, y: number, emoji: string) {
  userDrawing.font = `${currentLineWidth * 10}px serif`;
  userDrawing.fillText(emoji, x, y);
}

let isDraggingEmoji = false;
let emojiPosition: Point = { x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  isDraggingEmoji = true;
  if (currentTool) {
    emojiPosition = { x: e.offsetX - 15, y: e.offsetY + 1 };
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  } else {
    currentPath = createDrawablePath(currentLineWidth, currentLineColor);
    currentPath.addPoint(e.offsetX, e.offsetY);
    paths.push(currentPath);
    currentPath.display(userDrawing);
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  }
});

canvas.addEventListener("mousemove", (e) => {
  new CustomEvent("tool-moved", { detail: { x: e.offsetX, y: e.offsetY } });

  if (isDraggingEmoji && currentTool) {
    emojiPosition = { x: e.offsetX - 15, y: e.offsetY + 1 };
    userDrawing.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => path.display(userDrawing));
    drawEmoji(emojiPosition.x, emojiPosition.y, currentTool);
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  } else if (isDrawing && currentPath) {
    currentPath.addPoint(e.offsetX, e.offsetY);
    currentPath.display(userDrawing);
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  }

  if (currentTool) {
    currentToolPreview = createEmojiToolPreview(currentTool);
  } else {
    currentToolPreview = createCircleToolPreview(currentLineWidth);
  }

  if (currentToolPreview) {
    currentToolPreview.setPosition(e.offsetX, e.offsetY);
    userDrawing.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => path.display(userDrawing));
    currentToolPreview.draw(userDrawing);
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDraggingEmoji && currentTool) {
    const emojiDrawable = createDrawableEmoji(currentTool);
    emojiDrawable.addPoint(emojiPosition.x, emojiPosition.y);
    paths.push(emojiDrawable);
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  }

  isDrawing = false;
  isDraggingEmoji = false;
});

function createExtraButtons(buttonTitle: string) {
  const button = document.createElement("button");
  button.className = "selected-tool extra-button";
  button.textContent = buttonTitle;
  return button;
}

// Adding a clear button to clear the canvas and centering it underneath the canvas
const clearButton = createExtraButtons("Clear Drawing");
clearButton.onclick = () => {
  userDrawing.clearRect(0, 0, canvas.width, canvas.height);
  paths.length = 0; // Clear the paths array
  canvas.dispatchEvent(
    new CustomEvent("drawing-changed", { detail: { paths } })
  );
};
canvasContainer.appendChild(clearButton);

const redoStack: Drawable[] = []; // Stack to store undone paths

// Adding an undo button to undo the last stroke and centering it underneath the canvas
const undoButton = createExtraButtons("Undo");
undoButton.onclick = () => {
  if (paths.length > 0) {
    const lastPath = paths.pop(); // Remove the last path from the paths array
    if (lastPath) {
      redoStack.push(lastPath); // Add the last path to the redo stack
    }
    userDrawing.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => path.display(userDrawing));
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  }
};
canvasContainer.appendChild(undoButton);

// Adding a redo button to redo the last undone stroke and centering it underneath the canvas
const redoButton = createExtraButtons("Redo");
redoButton.onclick = () => {
  if (redoStack.length > 0) {
    const lastUndonePath = redoStack.pop(); // Remove the last undone path from the redo stack
    if (lastUndonePath) {
      paths.push(lastUndonePath); // Add the last undone path back to the paths array
    }
    userDrawing.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => path.display(userDrawing));
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  }
};
canvasContainer.appendChild(redoButton);

// Adding an export button to export the drawing as an image and centering it underneath the canvas
const exportButton = createExtraButtons("Export Drawing");
exportButton.onclick = () => {
  // Temporarily create a new canvas object of size 1024x1024
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;
  exportCtx.scale(4, 4); // Scale the context to fit the larger canvas
  paths.forEach((path) => path.display(exportCtx)); // Redraw all paths on the new canvas

  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = exportCanvas.toDataURL();
  link.click();
};
canvasContainer.appendChild(exportButton);


// Set the document title
document.title = APP_NAME;
