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

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

const userDrawing = canvas.getContext("2d")!;
let isDrawing = false;
const paths: Drawable[] = [];
let currentPath: Drawable | null = null;
let currentLineWidth = 1;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentPath = createDrawablePath(currentLineWidth);
  currentPath.addPoint(e.offsetX, e.offsetY);
  paths.push(currentPath);
  currentPath.display(userDrawing);
  canvas.dispatchEvent(
    new CustomEvent("drawing-changed", { detail: { paths } })
  );
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentPath) {
    currentPath.addPoint(e.offsetX, e.offsetY);
    currentPath.display(userDrawing);
    canvas.dispatchEvent(
      new CustomEvent("drawing-changed", { detail: { paths } })
    );
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

// Creating a container for the buttons and setting its style
// Asked Copilot for help on this and it gave this
const buttonContainer = document.createElement("div");
buttonContainer.style.display = "flex";
buttonContainer.style.flexDirection = "column";
buttonContainer.style.alignItems = "center";
buttonContainer.style.position = "absolute";
buttonContainer.style.left = "250px";
buttonContainer.style.top = "50%";
buttonContainer.style.transform = "translateY(-50%)";
app.appendChild(buttonContainer);

// Function to create a tool button
function createToolButton(label: string, lineWidth: number) {
  const button = document.createElement("button");
  button.textContent = label;
  button.style.display = "block";
  button.style.margin = "5px 0";
  button.onclick = () => {
    currentLineWidth = lineWidth;
    userDrawing.lineWidth = currentLineWidth;
    selectedToolFeedback.textContent = `Selected Tool: ${label}`;
    selectedToolFeedback.className = `selected-tool ${label.toLowerCase()}`;
  };
  return button;
}

// Creating buttons for 'thin' and 'thick' marker tools and adding them to the container
const thinButton = createToolButton("Thin", 1);
const thickButton = createToolButton("Thick", 5);

buttonContainer.appendChild(thinButton);
buttonContainer.appendChild(thickButton);

// Create an element to display the selected tool feedback
const selectedToolFeedback = document.createElement("div");
selectedToolFeedback.className = "selected-tool";
selectedToolFeedback.textContent = "Selected Tool: Thin";
buttonContainer.appendChild(selectedToolFeedback);

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
