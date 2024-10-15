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
// Drawn lines have gold drop shadow because of the canvas styling in style.css
const userDrawing = canvas.getContext("2d")!;
let isDrawing = false;
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  userDrawing.beginPath();
  userDrawing.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    userDrawing.lineTo(e.offsetX, e.offsetY);
    userDrawing.stroke();
  }
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});

// Adding a clear button to clear the canvas and centering it underneath the canvas
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Drawing";
clearButton.style.display = "block";
clearButton.style.margin = "10px auto";
clearButton.onclick = () => {
  userDrawing.clearRect(0, 0, canvas.width, canvas.height);
};
app.appendChild(clearButton);

// Set the document title
document.title = APP_NAME;
