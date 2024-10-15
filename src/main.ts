import "./style.css";

const APP_NAME = "This is the app title";
const app = document.querySelector<HTMLDivElement>("#app")!;

// Create and append the title element
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

// Adding a canvas to webpage of size 256x256
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.appendChild(canvas);

// Let user draw on canvas with mouse (by registering observers for mouse events)
// Save the user's mouse positions into an array of arrays of points
const userDrawing = canvas.getContext("2d")!;
let isDrawing = false;
const paths: { x: number; y: number }[][] = [];
let currentPath: { x: number; y: number }[] = [];

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentPath = [{ x: e.offsetX, y: e.offsetY }];
  paths.push(currentPath);
  userDrawing.beginPath(); // Start a new path
  userDrawing.moveTo(e.offsetX, e.offsetY); // Move to the starting point of the new path
  canvas.dispatchEvent(
    new CustomEvent("drawing-changed", { detail: { paths } })
  );
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const point = { x: e.offsetX, y: e.offsetY };
    currentPath.push(point);
    userDrawing.lineTo(point.x, point.y);
    userDrawing.stroke();
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
  userDrawing.beginPath(); // Reset the drawing context path
  paths.length = 0; // Clear the paths array
  canvas.dispatchEvent(
    new CustomEvent("drawing-changed", { detail: { paths } })
  );
};
app.appendChild(clearButton);

// Set the document title
document.title = APP_NAME;
