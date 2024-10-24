const blocks = document.querySelectorAll('.block');
const dropzone = document.getElementById('dropzone');
const codeBlocks = document.getElementById('codeBlocks');
const feedback = document.getElementById('feedback');

let draggedBlock = null;

blocks.forEach(block => {
    block.addEventListener('dragstart', function() {
        draggedBlock = block;
        setTimeout(function() {
            block.style.display = 'none'; // Hide the block during drag
        }, 0);
    });

    block.addEventListener('dragend', function() {
        setTimeout(function() {
            draggedBlock.style.display = 'block'; // Show the block after drop
            draggedBlock = null;
        }, 0);
    });
});

// Allow dropping in drop zone
dropzone.addEventListener('dragover', function(e) {
    e.preventDefault(); // Allow the drop
});

dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    if (draggedBlock) {
        dropzone.appendChild(draggedBlock); // Append block to dropzone
    }
});

// Allow dragging back to code blocks
codeBlocks.addEventListener('dragover', function(e) {
    e.preventDefault(); // Allow the drop
});

codeBlocks.addEventListener('drop', function(e) {
    e.preventDefault();
    if (draggedBlock) {
        codeBlocks.appendChild(draggedBlock); // Append block back to code blocks
    }
});

// Check if the order is correct
function checkOrder() {
    const correctOrder = ["line3", "line2", "line4", "line1","line5"];
    let userOrder = Array.from(dropzone.children).map(block => block.id);

    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
        feedback.textContent = "Correct Order!";
        feedback.style.color = "green";
    } else {
        feedback.textContent = "Incorrect Order. Please try again.";
        feedback.style.color = "red";
    }
}