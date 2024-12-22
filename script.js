const editorDiv = document.getElementById("editor");
const preview = document.getElementById("preview");
const togglePreviewButton = document.getElementById("toggle-preview");
const copyButton = document.getElementById("copy");
const downloadButton = document.getElementById("download");
const dropdown = document.querySelector(".dropdown");

let versionHistory = []; // Array to store document versions
let currentVersionIndex = -1; // Track the current version index

// Function to save the current version
function saveVersion() {
    const currentContent = editor.getValue();
    // If the current version is not the latest, remove all future versions
    if (currentVersionIndex < versionHistory.length - 1) {
        versionHistory = versionHistory.slice(0, currentVersionIndex + 1);
    }
    versionHistory.push(currentContent);
    currentVersionIndex++;
    alert("Version saved!");
}

// Function to restore a previous version
function restoreVersion(index) {
    if (index >= 0 && index < versionHistory.length) {
        editor.setValue(versionHistory[index]);
        currentVersionIndex = index;
        updatePreview();
    }
}

// Add buttons for saving and restoring versions in the HTML
const saveVersionButton = document.createElement('button');
saveVersionButton.textContent = "Save Version";
document.querySelector('.buttons').appendChild(saveVersionButton);

const restoreVersionButton = document.createElement('button');
restoreVersionButton.textContent = "Restore Version";
document.querySelector('.buttons').appendChild(restoreVersionButton);

// Event listeners for the new buttons
saveVersionButton.addEventListener("click", saveVersion);
restoreVersionButton.addEventListener("click", () => {
    const index = prompt("Enter the version number to restore (0 to " + (versionHistory.length - 1) + "):");
    if (index !== null) {
        restoreVersion(parseInt(index));
    }
});

const darkModeButton = document.createElement('button');
darkModeButton.textContent = "Toggle Dark Mode";
document.querySelector('.buttons').appendChild(darkModeButton);

// Event listener for dark mode toggle
darkModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});


// Initialize CodeMirror
const editor = CodeMirror(editorDiv, {
   mode: "markdown",
   lineNumbers: true,
   lineWrapping: true,
   theme: "default" // You can choose other themes as well
});

// Function to render Markdown and update preview
function renderMarkdown(md) {
    return md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')  // Headers level 3
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')  // Headers level 2
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')   // Headers level 1
        .replace(/^\*\*\*(\s*)$/gm, '<hr>')      // Horizontal rule with ***
        .replace(/^---(\s*)$/gm, '<hr>')         // Horizontal rule with ---
        .replace(/^___(\s*)$/gm, '<hr>')         // Horizontal rule with ___
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // Bold
        .replace(/\*(.*)\*/gim, '<i>$1</i>')     // Italic
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>') // Links
        .replace(/\n/gim, '<br>');                // Line breaks
}


// Function to update preview content
function updatePreview() {
   preview.innerHTML = renderMarkdown(editor.getValue());
}

// Toggle preview display
togglePreviewButton.addEventListener("click", () => {
   if (preview.style.display === "none") {
       preview.style.display = "block";
       updatePreview();
       togglePreviewButton.textContent = "Hide Preview";
   } else {
       preview.style.display = "none";
       togglePreviewButton.textContent = "Show Preview";
   }
});

// Sync changes from CodeMirror to preview
editor.on("change", updatePreview);

// Copy to clipboard
copyButton.addEventListener("click", () => {
   navigator.clipboard.writeText(editor.getValue()).then(() => {
       alert("Copied to clipboard!");
   });
});

// Dropdown toggle for download options
downloadButton.addEventListener("click", () => {
   dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Download content in selected format
dropdown.addEventListener("click", (e) => {
   const format = e.target.dataset.format; 
   if (!format) return;

   let content = editor.getValue(); 
   let blob, filename;

   switch (format) {
       case "md":
           blob = new Blob([content], { type: "text/markdown" });
           filename = "document.md";
           break; 
       case "txt":
           blob = new Blob([content], { type: "text/plain" });
           filename = "document.txt"; 
           break; 
       case "html":
           blob = new Blob([`<html><body>${renderMarkdown(content)}</body></html>`], { type: "text/html" });
           filename = "document.html"; 
           break; 
       case "pdf":
           const { jsPDF } = window.jspdf; 
           const doc = new jsPDF(); 

           const lines = content.split("\n"); 
           let y = 10; 
           lines.forEach(line => { 
               doc.text(line, 10, y); 
               y += 10; 
           });

           doc.save("document.pdf"); 
           return; 
       default:
           return; 
   }

   const link = document.createElement("a"); 
   link.href = URL.createObjectURL(blob); 
   link.download = filename; 
   link.click(); 
   URL.revokeObjectURL(link.href); 
   dropdown.style.display = "none"; 
});

// Close dropdown if clicked outside
document.addEventListener("click", (e) => { 
   if (!downloadButton.contains(e.target) && !dropdown.contains(e.target)) { 
       dropdown.style.display = "none"; 
   } 
});
