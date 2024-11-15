// ========== Drag and Drop Block Setup ==========
const blocks = document.querySelectorAll('.block');
const dropzone = document.getElementById('dropzone');
const codeBlocks = document.getElementById('codeBlocks');
const feedback = document.getElementById('feedback');
let draggedBlock = null;



// ========== Firebase Initialization ==========
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getDatabase, ref, set, get, child } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyCQkkRBTquigA2i67vR_RCY9dmggUOO--I",
    authDomain: "pawm-backend.firebaseapp.com",
    databaseURL : "https://pawm-backend-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "pawm-backend",
    storageBucket: "pawm-backend.firebasestorage.app",
    messagingSenderId: "530232094361",
    appId: "1:530232094361:web:f063c516cd162233809208",
    measurementId: "G-NCFQYXR9TM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Global variables
let userScore = 0;
let currentQuestion = 1;
const MAX_SCORE = 40;  // Added maximum score constant

// Define correct answers for each question
const correctAnswers = {
    1: [
        "def evenOdd():",
        "if (x % 2 == 0):",
        "print(\"even\")",
        "else:",
        "print(\"odd\")"
    ],
    2: [
        "def greet():",
        "print(\"Hello, world!\")",
        "greet()"
    ],
    3: [
        "x = 5",
        "if x > 3:",
        "print(\"x is greater than 3\")"
    ],
    4: [
        "for i in range(3):",
        "print(i)"
    ]
};

// Helper function to check if arrays are equal
const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
};

// Function to check answers
window.checkAnswer = (questionNum) => {
    const dropZone = document.getElementById(`dropzone${questionNum}`);
    if (!dropZone) return;

    const submittedBlocks = Array.from(dropZone.querySelectorAll('.block'));
    const submittedAnswer = submittedBlocks.map(block => block.textContent);
    const correctAnswer = correctAnswers[questionNum];
    const feedback = document.getElementById('feedback');
    
    if (!feedback) return;

    const isCorrect = arraysEqual(submittedAnswer, correctAnswer);
    
    if (isCorrect) {
        // Check if adding 10 points would exceed the maximum score
        if (userScore >= MAX_SCORE) {
            feedback.textContent = 'You have reached the maximum score!';
            feedback.style.color = '#28a745';
            return;
        }
        
        // Add points only if we haven't reached the maximum
        userScore = Math.min(userScore + 10, MAX_SCORE);
        
        if (userScore === MAX_SCORE) {
            feedback.textContent = 'You have reached the maximum score!';
        } else {
            feedback.textContent = 'Correct! Well done!';
        }
        feedback.style.color = '#28a745';
        
        // Automatically move to next question after 1.5 seconds if not on last question
        // and if we haven't reached max score
        if (questionNum < 4 && userScore < MAX_SCORE) {
            setTimeout(() => showQuestion(questionNum + 1), 1500);
        }
    } else {
        feedback.textContent = 'Incorrect. Try again!';
        feedback.style.color = '#dc3545';
    }

    // Update score displays
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${userScore}/${MAX_SCORE}`;
    }

    const userScoreDisplay = document.getElementById('userScore');
    if (userScoreDisplay) {
        userScoreDisplay.textContent = userScore;
    }
};

// Function to show different questions
window.showQuestion = (questionNumber) => {
    currentQuestion = questionNumber;
    
    // Hide all questions
    document.querySelectorAll('.question').forEach(q => {
        q.style.display = 'none';
    });
    
    // Show selected question
    const selectedQuestion = document.getElementById(`question${questionNumber}`);
    if (selectedQuestion) {
        selectedQuestion.style.display = 'block';
    }
    
    // Update active question indicator
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.remove('active');
    });
    const questionItem = document.querySelector(`.question-item[onclick="showQuestion(${questionNumber})"]`);
    if (questionItem) {
        questionItem.classList.add('active');
    }
};

// Function to make an element draggable
const makeDraggable = (element) => {
    element.draggable = true;
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', element.textContent);
        e.dataTransfer.setData('source-container', element.parentElement.id || 'code-blocks');
        element.classList.add('dragging');
    });

    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
    });
};

// Initialize drag and drop functionality
const initDragAndDrop = () => {
    // Initialize all initial blocks
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(block => makeDraggable(block));

    // Get all drop zones and the code blocks container
    const dropzones = document.querySelectorAll('.drop-zone');
    const codeBlocksContainer = document.querySelector('.code-blocks');

    const handleDrop = (e, container) => {
        e.preventDefault();
        container.classList.remove('dragover');
        
        const data = e.dataTransfer.getData('text/plain');
        const sourceContainerId = e.dataTransfer.getData('source-container');
        const sourceElement = document.querySelector(`#${sourceContainerId} .dragging`);
        
        // Remove the original element if it exists
        if (sourceElement) {
            sourceElement.remove();
        }

        // Create new block
        const newBlock = document.createElement('div');
        newBlock.className = 'block';
        newBlock.textContent = data;
        makeDraggable(newBlock);
        
        // Add to the new container
        container.appendChild(newBlock);
    };

    // Add drag and drop handlers to dropzones
    dropzones.forEach(dropzone => {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => handleDrop(e, dropzone));
    });

    // Add drag and drop handlers to code blocks container
    if (codeBlocksContainer) {
        codeBlocksContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            codeBlocksContainer.classList.add('dragover');
        });

        codeBlocksContainer.addEventListener('dragleave', () => {
            codeBlocksContainer.classList.remove('dragover');
        });

        codeBlocksContainer.addEventListener('drop', (e) => handleDrop(e, codeBlocksContainer));
    }
};

// Function to update score display
const updateScoreDisplay = () => {
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Current Score: ${userScore}/${MAX_SCORE}`;
    }
};

// Function to save score to Firebase
const submitScore = async () => {
    const user = auth.currentUser;
    if (!user) {
        showFailure("You must be logged in to save your score.");
        return;
    }

    const formattedTimestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false
    });

    try {
        await set(ref(db, 'user_scores/' + user.uid), {
            score: userScore,
            timestamp: formattedTimestamp
        });
        showSuccess("Score saved successfully!");
    } catch (error) {
        console.error("Error saving score:", error);
        showFailure("Failed to save score. Please try again.");
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    showQuestion(1);

    // Create score display if it doesn't exist
    if (!document.getElementById('score')) {
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score';
        scoreDisplay.textContent = `Current Score: 0/${MAX_SCORE}`;
        scoreDisplay.style.marginTop = '20px';
        scoreDisplay.style.fontSize = '18px';
        scoreDisplay.style.fontWeight = 'bold';
        const rightSection = document.querySelector('.right-section');
        if (rightSection) {
            rightSection.appendChild(scoreDisplay);
        }
    }

    // Add event listener to submit score button
    const submitScoreButton = document.getElementById('submitScore');
    if (submitScoreButton) {
        submitScoreButton.addEventListener('click', submitScore);
    }

    // Add event listeners to submit buttons for each question
    document.querySelectorAll('.submit').forEach((button, index) => {
        button.addEventListener('click', () => checkAnswer(index + 1));
    });
});






// ========== Helper Functions ==========
const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-popup';
    successDiv.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <div class="success-message">${message}</div>
        </div>
    `;
    document.body.appendChild(successDiv);

    // Trigger animation by adding the 'show' class
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 30);

    // Remove popup after showing and redirect
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successDiv);
            window.location.href = "../homepage.html"; // Redirect after popup disappears
        }, 300);
    }, 2000);
};

const showSuccess2 = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-popup';
    successDiv.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <div class="success-message">${message}</div>
        </div>
    `;
    document.body.appendChild(successDiv);

    // Trigger animation by adding the 'show' class
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 30);

    // Remove popup after showing and redirect
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successDiv);
            window.location.href = "login.html"; // Redirect after popup disappears
        }, 300);
    }, 2000);
};

const logoutButton = document.getElementById("logoutButton");
const toggleAuthButtons = (isLoggedIn) => {
    document.getElementById("signInLink").style.display = isLoggedIn ? "none" : "block";
    document.getElementById("profileLink").style.display = isLoggedIn ? "block" : "none";
    document.getElementById("logoutLink").style.display = isLoggedIn ? "block" : "none";
};


const showError = (message) => {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.opacity = '1';
    
    // Add error shake animation
    errorDiv.classList.add('error-shake');
    setTimeout(() => {
        errorDiv.classList.remove('error-shake');
    }, 50);
    
    // Optional: Add CSS class for styling
    errorDiv.classList.add('error-message');
    
    // Clear error after 5 seconds with fade effect
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => {
            errorDiv.style.display = 'none';
            errorDiv.classList.remove('error-message');
        }, 30);
    }, 500);
};





const showFailure = (message) => {
    const failureDiv = document.createElement('div');
    failureDiv.className = 'failure-popup';
    failureDiv.innerHTML = `
        <div class="failure-content">
            <div class="failure-icon">✗</div>
            <div class="failure-message">${message}</div>
        </div>
    `;
    document.body.appendChild(failureDiv);

    // Trigger animation by adding the 'show' class
    setTimeout(() => {
        failureDiv.classList.add('show');
    }, 30);

    // Remove popup after showing
    setTimeout(() => {
        failureDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(failureDiv);
        }, 300);
    }, 2000);
};


const toggleLoading = (show) => {
    const spinner = document.getElementById('loading-spinner');
    const buttons = document.querySelectorAll('.login-btn');
    if (spinner) spinner.style.display = show ? 'flex' : 'none';
    buttons.forEach(btn => {
        btn.disabled = show;
        btn.style.opacity = show ? '0.7' : '1';
    });
};

const toggleProfileButton = (isLoggedIn) => {
    const signInLink = document.getElementById("signInLink");
    const profileLink = document.getElementById("profileLink");

    if (signInLink && profileLink) {
        signInLink.style.display = isLoggedIn ? "none" : "block";
        profileLink.style.display = isLoggedIn ? "block" : "none";
    }
};

const toggleForms = (showSignUp) => {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    
    if (showSignUp) {
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
        // Focus on the first input field of signup form
        setTimeout(() => {
            document.getElementById('signup-email').focus();
        }, 100); // Small delay to ensure the form is visible
    } else {
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        // Focus on the first input field of login form
        setTimeout(() => {
            document.getElementById('signin-email').focus();
        }, 100);
    }
};





// ========== Event Listeners ==========
document.addEventListener("DOMContentLoaded", () => {
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");

    // Authentication State Observer
    onAuthStateChanged(auth, (user) => {
        toggleProfileButton(!!user);
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateScoreDisplay(user.uid);
        }
    });
    // Sign-In Form Submission
    if (signinForm) {
        signinForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            toggleLoading(true);

            const email = document.getElementById("signin-email").value;
            const password = document.getElementById("signin-password").value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("User signed in:", userCredential.user);
                showSuccess("Sign in successful! Redirecting...");
                toggleProfileButton(true);
            } catch (error) {
                console.error("Error signing in:", error);
                showFailure("Sign in failed. Please check your credentials.");
            } finally {
                toggleLoading(false);
            }
        });

        const submitButtons = document.querySelectorAll('.submit');
        submitButtons.forEach((button, index) => {
            button.addEventListener('click', () => checkOrder(index + 1));
        });

        // Add event listener to button
        const submitScoreButton = document.getElementById('submitScore');
        if (submitScoreButton) {
            submitScoreButton.addEventListener('click', submitScore);
        }

    }


    const showSignUpLink = document.getElementById('showSignUpLink');
        if (showSignUpLink) {
            showSignUpLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleForms(true);
            });
        }

        if (signupForm) {
            signupForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                toggleLoading(true);

                const email = document.getElementById("signup-email").value;
                const password = document.getElementById("signup-password").value;

                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    // console.log("User signed up:", userCredential.user);
                    showSuccess2("Sign up successful! Redirecting...");
                    toggleProfileButton(true);
                } catch (error) {
                    console.error("Error signing up:", error);
                    showFailure("Sign up failed. " + error.message);
                } finally {
                    toggleLoading(false);
                }
            });
    }

});


// Detect authentication state and toggle visibility of buttons
onAuthStateChanged(auth, (user) => {
    toggleAuthButtons(!!user);
});

// Logout Event Listener
if (logoutButton) {
    logoutButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            console.log("User signed out successfully.");
            toggleAuthButtons(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    });
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const scoreRef = ref(db, 'user_scores/' + user.uid);
        get(scoreRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                userScore = data.score || 0;
                updateScoreDisplay();
            }
        }).catch((error) => {
            console.error("Error retrieving score:", error);
        });
    }
});

