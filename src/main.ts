import "./style.css";

const APP_NAME = "This is the app title";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Create and append the title element
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

// Asked Copilot how to change my class declaration to interface and it gave me this
interface Point {
  x: number;
  y: number;
}

interface Drawable {
  addPoint(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
}

function createDrawablePath(): Drawable {
  const points: Point[] = [];

  const addPoint = (x: number, y: number) => {
    points.push({ x, y });
  };

  const display = (ctx: CanvasRenderingContext2D) => {
    if (points.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  };

  return { addPoint, display };
}

// Adding a canvas to webpage of size 256x256
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

// Let user draw on canvas with mouse (by registering observers for mouse events)
// Save the user's mouse positions into an array of Drawable objects
const userDrawing = canvas.getContext("2d")!;
let isDrawing = false;
const paths: Drawable[] = [];
let currentPath: Drawable | null = null;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentPath = createDrawablePath();
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
