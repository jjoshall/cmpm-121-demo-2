import "./style.css";

const APP_NAME = "Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Create and append the title element
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

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
}

// Function to create and display the drawing keeping in mind the line width
function createDrawablePath(lineWidth: number): Drawable {
  const points: Point[] = [];
  let currentLineWidth = lineWidth;

  const addPoint = (x: number, y: number) => {
    points.push({ x, y });
  };

  const display = (ctx: CanvasRenderingContext2D) => {
    if (points.length === 0) return;
    ctx.lineWidth = currentLineWidth;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  };

  const setLineWidth = (width: number) => {
    currentLineWidth = width;
  };

  const getLineWidth = () => currentLineWidth;

  return { addPoint, display, setLineWidth, getLineWidth };
}

function createDrawableEmoji(emoji: string): Drawable {
  const points: Point[] = [];
  const currentEmoji = emoji;

  const addPoint = (x: number, y: number) => {
    points.push({ x, y });
  };

  const display = (ctx: CanvasRenderingContext2D) => {
    ctx.font = "24px serif";
    points.forEach((point) => {
      ctx.fillText(currentEmoji, point.x, point.y);
    });
  };

  return { addPoint, display, setLineWidth: () => {}, getLineWidth: () => 24 };
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
    ctx.font = "20px serif";
    ctx.fillText(emoji, x - ctx.measureText(emoji).width / 2, y);
  };

  return { setPosition, draw };
}

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

const userDrawing = canvas.getContext("2d")!;
let isDrawing = false;
const paths: Drawable[] = [];
let currentPath: Drawable | null = null;
let currentLineWidth = 1;
let currentToolPreview: ToolPreview | null = null;

// Creating a container for the buttons and setting its style
// Asked Copilot for help on this and it gave this
const toolButtonContainer = document.createElement("div");
toolButtonContainer.style.display = "flex";
toolButtonContainer.style.flexDirection = "column";
toolButtonContainer.style.alignItems = "center";
toolButtonContainer.style.position = "absolute";
toolButtonContainer.style.left = "250px";
toolButtonContainer.style.top = "50%";
toolButtonContainer.style.transform = "translateY(-50%)";
app.appendChild(toolButtonContainer);

const emojiButtonContainer = document.createElement("div");
emojiButtonContainer.style.display = "flex";
emojiButtonContainer.style.flexDirection = "column";
emojiButtonContainer.style.alignItems = "center";
emojiButtonContainer.style.position = "absolute";
emojiButtonContainer.style.left = "850px";
emojiButtonContainer.style.top = "50%";
emojiButtonContainer.style.transform = "translateY(-50%)";
app.appendChild(emojiButtonContainer);

// Function to create a tool button
function createToolButton(label: string, lineWidth: number) {
  const button = document.createElement("button");
  button.textContent = label;
  button.style.display = "block";
  button.style.margin = "5px 0";
  button.onclick = () => {
    // turn emoji tool off
    currentTool = null;
    currentLineWidth = lineWidth;
    userDrawing.lineWidth = currentLineWidth;
    selectedToolFeedback.textContent = `Selected Tool: ${label}`;
    selectedToolFeedback.className = `selected-tool ${label.toLowerCase()}`;
  };
  return button;
}

// Creating buttons for 'thin' and 'thick' marker tools and adding them to the container
const thinButton = createToolButton("Thin", 2.5);
const thickButton = createToolButton("Thick", 7);

toolButtonContainer.appendChild(thinButton);
toolButtonContainer.appendChild(thickButton);

// Create an element to display the selected tool feedback
const selectedToolFeedback = document.createElement("div");
selectedToolFeedback.className = "selected-tool";
selectedToolFeedback.textContent = "Selected Tool: Thin";
toolButtonContainer.appendChild(selectedToolFeedback);

function createEmojiButton(emoji: string) {
  const button = document.createElement("button");
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

const smileyButton = createEmojiButton("😁");
const angerButton = createEmojiButton("😡");
const highFiveButton = createEmojiButton("🙏");

emojiButtonContainer.appendChild(smileyButton);
emojiButtonContainer.appendChild(angerButton);
emojiButtonContainer.appendChild(highFiveButton);

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
    currentPath = createDrawablePath(currentLineWidth);
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

// Adding a clear button to clear the canvas and centering it underneath the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Drawing";
clearButton.style.display = "block";
clearButton.style.margin = "10px auto";
clearButton.onclick = () => {
  userDrawing.clearRect(0, 0, canvas.width, canvas.height);
  paths.length = 0; // Clear the paths array
  canvas.dispatchEvent(
    new CustomEvent("drawing-changed", { detail: { paths } })
  );
};
app.appendChild(clearButton);

const redoStack: Drawable[] = []; // Stack to store undone paths

// Adding an undo button to undo the last stroke and centering it underneath the canvas
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.style.display = "block";
undoButton.style.margin = "10px auto";
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
app.appendChild(undoButton);

// Adding a redo button to redo the last undone stroke and centering it underneath the canvas
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.style.display = "block";
redoButton.style.margin = "10px auto";
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
app.appendChild(redoButton);

// Set the document title
document.title = APP_NAME;
