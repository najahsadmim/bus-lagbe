import {
    auth,
    googleProvider,
    signInWithPopup
} from "./firebase.js";

lucide.createIcons();

const loginFormContainer = document.getElementById("loginForm");
const signupFormContainer = document.getElementById("signupForm");

const showSignupButton = document.getElementById("showSignup");
const showLoginButton = document.getElementById("showLogin");

const loginForm = loginFormContainer.querySelector("form");
const signupForm = signupFormContainer.querySelector("form");

const loginPhoneInput = loginForm.querySelector('input[type="tel"]');
const loginPasswordInput = loginForm.querySelector('input[type="password"]');

const signupPhoneInput = signupForm.querySelector('input[type="tel"]');
const signupOtpInput = signupForm.querySelector('input[placeholder="Enter OTP"]');
const signupPasswordInputs = signupForm.querySelectorAll(
    'input[type="password"]'
);

const signupPasswordInput = signupPasswordInputs[0];
const googleSignInButton = document.getElementById("googleSignIn");
const confirmPasswordInput = signupPasswordInputs[1];

const OTP_CODE = "123456";

function createMessageElement(form) {
    const message = document.createElement("div");
    message.className = "form-message";
    form.appendChild(message);
    return message;
}

const loginMessage = createMessageElement(loginForm);
const signupMessage = createMessageElement(signupForm);

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `form-message ${type} visible`;

    setTimeout(() => {
        element.classList.remove("visible");
    }, 4000);
}

function clearMessage(element) {
    element.textContent = "";
    element.className = "form-message";
}

function normalizePhoneNumber(phoneNumber) {
    return phoneNumber.replace(/\s+/g, "").replace(/-/g, "");
}

function isValidBangladeshPhone(phoneNumber) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    return /^(?:\+8801|01)[3-9]\d{8}$/.test(normalizedPhone);
}

function getLocalPhoneNumber(phoneNumber) {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (normalizedPhone.startsWith("+880")) {
        return `0${normalizedPhone.slice(4)}`;
    }

    return normalizedPhone;
}

function getUsers() {
    const storedUsers = localStorage.getItem("busLagbeUsers");

    if (!storedUsers) {
        return [];
    }

    try {
        return JSON.parse(storedUsers);
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem("busLagbeUsers", JSON.stringify(users));
}

function switchToSignup() {
    clearMessage(loginMessage);

    loginFormContainer.classList.add("hidden");
    signupFormContainer.classList.remove("hidden");

    signupFormContainer.classList.add("form-enter");

    setTimeout(() => {
        signupFormContainer.classList.remove("form-enter");
    }, 500);
}

function switchToLogin() {
    clearMessage(signupMessage);

    signupFormContainer.classList.add("hidden");
    loginFormContainer.classList.remove("hidden");

    loginFormContainer.classList.add("form-enter");

    setTimeout(() => {
        loginFormContainer.classList.remove("form-enter");
    }, 500);
}

googleSignInButton.addEventListener("click", async () => {
    try {
        googleSignInButton.disabled = true;

        googleSignInButton.innerHTML = `
            <span class="google-spinner"></span>
            Connecting to Google...
        `;

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

        localStorage.setItem(
            "busLagbeCurrentUser",
            JSON.stringify({
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: "google",
                loginAt: new Date().toISOString()
            })
        );

        googleSignInButton.innerHTML = `
            <span class="google-success-icon">✓</span>
            Welcome, ${user.displayName || "Passenger"}
        `;

        setTimeout(() => {
            window.location.href = "home.html";
        }, 900);

    } catch (error) {
        console.error("Google Sign-In Error:", error);

        googleSignInButton.disabled = false;

        googleSignInButton.innerHTML = `
            <svg
                class="google-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.55 10.55 0 0 0 12 1a11 11 0 0 0-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        `;

        if (error.code === "auth/popup-closed-by-user") {
            showMessage(
                loginMessage,
                "Google sign-in was cancelled.",
                "error"
            );

            return;
        }

        if (error.code === "auth/unauthorized-domain") {
            showMessage(
                loginMessage,
                "This domain is not authorized in Firebase.",
                "error"
            );

            return;
        }

        showMessage(
            loginMessage,
            "Google sign-in failed. Please try again.",
            "error"
        );
    }
});

showSignupButton.addEventListener("click", event => {
    event.preventDefault();
    switchToSignup();
});

showLoginButton.addEventListener("click", event => {
    event.preventDefault();
    switchToLogin();
});

signupPhoneInput.addEventListener("blur", () => {
    const phoneNumber = signupPhoneInput.value.trim();

    if (!phoneNumber) {
        return;
    }

    if (!isValidBangladeshPhone(phoneNumber)) {
        signupPhoneInput.classList.add("input-error");

        showMessage(
            signupMessage,
            "Enter a valid Bangladeshi phone number.",
            "error"
        );

        return;
    }

    signupPhoneInput.classList.remove("input-error");

    showMessage(
        signupMessage,
        `Demo OTP sent. Use ${OTP_CODE}.`,
        "success"
    );
});

signupForm.addEventListener("submit", event => {
    event.preventDefault();

    clearMessage(signupMessage);

    const phoneNumber = signupPhoneInput.value.trim();
    const otp = signupOtpInput.value.trim();
    const password = signupPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    [
        signupPhoneInput,
        signupOtpInput,
        signupPasswordInput,
        confirmPasswordInput
    ].forEach(input => input.classList.remove("input-error"));

    if (!isValidBangladeshPhone(phoneNumber)) {
        signupPhoneInput.classList.add("input-error");

        showMessage(
            signupMessage,
            "Enter a valid Bangladeshi phone number.",
            "error"
        );

        return;
    }

    if (otp !== OTP_CODE) {
        signupOtpInput.classList.add("input-error");

        showMessage(
            signupMessage,
            "Incorrect OTP. Use 123456 for the demo.",
            "error"
        );

        return;
    }

    if (password.length < 6) {
        signupPasswordInput.classList.add("input-error");

        showMessage(
            signupMessage,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }

    if (password !== confirmPassword) {
        signupPasswordInput.classList.add("input-error");
        confirmPasswordInput.classList.add("input-error");

        showMessage(
            signupMessage,
            "Passwords do not match.",
            "error"
        );

        return;
    }

    const localPhoneNumber = getLocalPhoneNumber(phoneNumber);
    const users = getUsers();

    const existingUser = users.find(
        user => user.phone === localPhoneNumber
    );

    if (existingUser) {
        showMessage(
            signupMessage,
            "An account already exists with this phone number.",
            "error"
        );

        return;
    }

    const newUser = {
        id: `BL-${Date.now()}`,
        phone: localPhoneNumber,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    showMessage(
        signupMessage,
        "Account created successfully! Redirecting to login...",
        "success"
    );

    signupForm.reset();

    setTimeout(() => {
        switchToLogin();
        loginPhoneInput.value = localPhoneNumber;

        showMessage(
            loginMessage,
            "Account created. Login to continue.",
            "success"
        );
    }, 1300);
});

loginForm.addEventListener("submit", event => {
    event.preventDefault();

    clearMessage(loginMessage);

    const phoneNumber = loginPhoneInput.value.trim();
    const password = loginPasswordInput.value;

    loginPhoneInput.classList.remove("input-error");
    loginPasswordInput.classList.remove("input-error");

    if (!isValidBangladeshPhone(phoneNumber)) {
        loginPhoneInput.classList.add("input-error");

        showMessage(
            loginMessage,
            "Enter a valid Bangladeshi phone number.",
            "error"
        );

        return;
    }

    if (!password) {
        loginPasswordInput.classList.add("input-error");

        showMessage(
            loginMessage,
            "Enter your password.",
            "error"
        );

        return;
    }

    const localPhoneNumber = getLocalPhoneNumber(phoneNumber);
    const users = getUsers();

    const matchedUser = users.find(
        user =>
            user.phone === localPhoneNumber &&
            user.password === password
    );

    if (!matchedUser) {
        loginPhoneInput.classList.add("input-error");
        loginPasswordInput.classList.add("input-error");

        showMessage(
            loginMessage,
            "Incorrect phone number or password.",
            "error"
        );

        return;
    }

    localStorage.setItem(
        "busLagbeCurrentUser",
        JSON.stringify({
            id: matchedUser.id,
            phone: matchedUser.phone,
            loginAt: new Date().toISOString()
        })
    );

    const loginButton = loginForm.querySelector(".primary-btn");

    loginButton.disabled = true;
    loginButton.innerHTML = `
        <span class="button-spinner"></span>
        Logging in...
    `;

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1000);
});

loginPhoneInput.addEventListener("input", () => {
    loginPhoneInput.classList.remove("input-error");
});

loginPasswordInput.addEventListener("input", () => {
    loginPasswordInput.classList.remove("input-error");
});

signupPhoneInput.addEventListener("input", () => {
    signupPhoneInput.classList.remove("input-error");
});

signupOtpInput.addEventListener("input", () => {
    signupOtpInput.classList.remove("input-error");
});

signupPasswordInput.addEventListener("input", () => {
    signupPasswordInput.classList.remove("input-error");
});

confirmPasswordInput.addEventListener("input", () => {
    confirmPasswordInput.classList.remove("input-error");
});
