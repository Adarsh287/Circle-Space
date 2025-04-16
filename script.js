const firebaseConfig = {
    apiKey: "AIzaSyAyQfGC56dqmcRGwb-ZFzxgO2f1FceqPkc",
    authDomain: "communityplatform-4cd65.firebaseapp.com",
    projectId: "communityplatform-4cd65",
    storageBucket: "communityplatform-4cd65.firebasestorage.app", 
    messagingSenderId: "378118087548",
    appId: "1:378118087548:web:a57649b4d4302733e4faf9",
    measurementId: "G-LFPPGG23KL" 
};
function openPage(){
    window.location.href='home.html'
}

function moveToLogin(){
    window.location.href='index.html'
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); 

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutButton = document.getElementById('logout-button');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const messageArea = document.getElementById('message-area');

const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const userEmailSpan = document.getElementById('user-email');

const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');

function clearErrors() {
    loginError.textContent = '';
    registerError.textContent = '';
    messageArea.textContent = ''; 
}

function showLogin() {
    clearErrors();
    loginContainer.classList.remove('hidden');
    registerContainer.classList.add('hidden');
}

function showRegister() {
    clearErrors();
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
}

function displayAuthError(error, element) {
    let message = "An unknown error occurred.";
    switch (error.code) {
        case 'auth/invalid-email':
            message = "Please enter a valid email address.";
            break;
        case 'auth/user-disabled':
            message = "This user account has been disabled.";
            break;
        case 'auth/user-not-found':
            message = "No account found with this email.";
            break;
        case 'auth/wrong-password':
            message = "Incorrect password. Please try again.";
            break;
        case 'auth/email-already-in-use':
            message = "An account already exists with this email address.";
            break;
        case 'auth/weak-password':
            message = "Password is too weak. It must be at least 6 characters long.";
            break;
        case 'auth/operation-not-allowed':
            message = "Email/password sign-in is not enabled in Firebase.";
             break;
        default:
            message = error.message; 
            console.error("Firebase Auth Error:", error);
    }
    element.textContent = message;
}

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    showRegister();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    showLogin();
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        loginError.textContent = "Please enter both email and password.";
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User logged in:", user.email);
             messageArea.textContent = "Login successful!";
             messageArea.style.color = "green";
             windows.location.replace='home.html';
        })
        .catch((error) => {
            displayAuthError(error, loginError);
        });
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // windows.location.href='home.html';

    clearErrors();

    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

     if (!email || !password) {
        registerError.textContent = "Please enter both email and password.";
        return;
     }
     if (password.length < 6) {
         registerError.textContent = "Password must be at least 6 characters long.";
         return;
     }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            windows.location.href='home.html';

            console.log("User registered:", user.email);
            messageArea.textContent = "Registration successful! You are now logged in.";
            messageArea.style.color = "green";
        })
        .catch((error) => {
             displayAuthError(error, registerError);
        });
});

logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log("User signed out");
         messageArea.textContent = "You have been logged out.";
         messageArea.style.color = "green";
    }).catch((error) => {
        console.error("Sign out error:", error);
        messageArea.textContent = "Error signing out: " + error.message;
        messageArea.style.color = "red";
    });
});


auth.onAuthStateChanged((user) => {
     clearErrors(); 
    if (user) {
        console.log("Auth state changed: User is logged in", user.email);
        userEmailSpan.textContent = user.email;
        loggedInView.classList.remove('hidden');
        loggedOutView.classList.add('hidden');
    } else {
        console.log("Auth state changed: User is logged out");
        loggedInView.classList.add('hidden');
        loggedOutView.classList.remove('hidden');
        showLogin(); 
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        registerEmailInput.value = '';
        registerPasswordInput.value = '';
    }
});

