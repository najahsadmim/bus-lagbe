const profileImage = document.getElementById(
    "profileImage"
);

const profileAvatarIcon = document.getElementById(
    "profileAvatarIcon"
);

const sidebarName = document.getElementById(
    "sidebarName"
);

const sidebarIdentity = document.getElementById(
    "sidebarIdentity"
);

const profileName = document.getElementById(
    "profileName"
);

const profilePhone = document.getElementById(
    "profilePhone"
);

const profileEmail = document.getElementById(
    "profileEmail"
);

const profileCity = document.getElementById(
    "profileCity"
);

const editProfileButton = document.getElementById(
    "editProfileButton"
);

const profileForm = document.getElementById(
    "profileForm"
);

const profileFormActions = document.getElementById(
    "profileFormActions"
);

const cancelProfileButton = document.getElementById(
    "cancelProfileButton"
);

const profileSuccess = document.getElementById(
    "profileSuccess"
);

const profileReservations = document.getElementById(
    "profileReservations"
);

const profileSeats = document.getElementById(
    "profileSeats"
);

const profileSpent = document.getElementById(
    "profileSpent"
);

const profileLogoutButton = document.getElementById(
    "profileLogoutButton"
);

let currentUser = {};
let originalProfile = {};

function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "busLagbeCurrentUser"
            )
        ) || {};
    } catch {
        return {};
    }
}

function getReservations() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "busLagbeReservations"
            )
        ) || [];
    } catch {
        return [];
    }
}

function displayProfile() {
    currentUser = getCurrentUser();

    sidebarName.textContent =
        currentUser.name ||
        currentUser.displayName ||
        "Passenger";

    sidebarIdentity.textContent =
        currentUser.email ||
        currentUser.phone ||
        "Bus Lagbe Account";

    profileName.value =
        currentUser.name ||
        currentUser.displayName ||
        "";

    profilePhone.value =
        currentUser.phone || "";

    profileEmail.value =
        currentUser.email || "";

    profileCity.value =
        currentUser.city || "Dhaka";

    if (currentUser.photoURL) {
        profileImage.src = currentUser.photoURL;

        profileImage.classList.remove("hidden");

        profileAvatarIcon.classList.add("hidden");
    }

    originalProfile = {
        name: profileName.value,
        phone: profilePhone.value,
        email: profileEmail.value,
        city: profileCity.value
    };
}

function loadJourneyStats() {
    const reservations = getReservations();

    const seats = reservations.reduce(
        (total, reservation) =>
            total + Number(reservation.seats || 0),
        0
    );

    const spent = reservations.reduce(
        (total, reservation) =>
            total + Number(
                reservation.totalFare || 0
            ),
        0
    );

    profileReservations.textContent =
        reservations.length;

    profileSeats.textContent = seats;

    profileSpent.textContent =
        spent.toLocaleString("en-BD");
}

function setEditingState(editing) {
    [
        profileName,
        profilePhone,
        profileEmail,
        profileCity
    ].forEach(input => {
        input.disabled = !editing;
    });

    profileFormActions.classList.toggle(
        "hidden",
        !editing
    );

    editProfileButton.classList.toggle(
        "hidden",
        editing
    );

    if (editing) {
        profileName.focus();
    }
}

editProfileButton.addEventListener("click", () => {
    setEditingState(true);
});

cancelProfileButton.addEventListener("click", () => {
    profileName.value = originalProfile.name;

    profilePhone.value = originalProfile.phone;

    profileEmail.value = originalProfile.email;

    profileCity.value = originalProfile.city;

    setEditingState(false);
});

profileForm.addEventListener("submit", event => {
    event.preventDefault();

    const updatedUser = {
        ...currentUser,
        name: profileName.value.trim(),
        displayName:
            profileName.value.trim(),
        phone: profilePhone.value.trim(),
        email: profileEmail.value.trim(),
        city: profileCity.value.trim()
    };

    localStorage.setItem(
        "busLagbeCurrentUser",
        JSON.stringify(updatedUser)
    );

    currentUser = updatedUser;

    originalProfile = {
        name: profileName.value,
        phone: profilePhone.value,
        email: profileEmail.value,
        city: profileCity.value
    };

    sidebarName.textContent =
        updatedUser.name || "Passenger";

    sidebarIdentity.textContent =
        updatedUser.email ||
        updatedUser.phone ||
        "Bus Lagbe Account";

    setEditingState(false);

    profileSuccess.classList.remove("hidden");

    if (
        typeof addBusLagbeNotification ===
        "function"
    ) {
        addBusLagbeNotification(
            "Profile updated",
            "Your account information was updated successfully.",
            "user"
        );
    }

    setTimeout(() => {
        profileSuccess.classList.add("hidden");
    }, 3500);
});

profileLogoutButton.addEventListener(
    "click",
    () => {
        localStorage.removeItem(
            "busLagbeCurrentUser"
        );

        window.location.href = "index.html";
    }
);

window.addEventListener("DOMContentLoaded", () => {
    displayProfile();

    loadJourneyStats();

    lucide.createIcons();
});
