const summaryBusOperator = document.getElementById("summaryBusOperator");
const summaryBusRegistration = document.getElementById(
    "summaryBusRegistration"
);
const summaryPickup = document.getElementById("summaryPickup");
const summaryDestination = document.getElementById("summaryDestination");
const summarySeatCount = document.getElementById("summarySeatCount");
const summaryFarePerSeat = document.getElementById("summaryFarePerSeat");
const summarySeats = document.getElementById("summarySeats");
const summaryTotalFare = document.getElementById("summaryTotalFare");
const reservationId = document.getElementById("reservationId");
const payButtonAmount = document.getElementById("payButtonAmount");

const paymentMethods = document.querySelectorAll(".payment-method");

const selectedPaymentSection = document.getElementById(
    "selectedPaymentSection"
);

const selectedMethodName = document.getElementById("selectedMethodName");
const paymentPhone = document.getElementById("paymentPhone");
const paymentPhoneError = document.getElementById("paymentPhoneError");
const payNowButton = document.getElementById("payNowButton");

const paymentStatusOverlay = document.getElementById(
    "paymentStatusOverlay"
);

const paymentProcessingState = document.getElementById(
    "paymentProcessingState"
);

const paymentSuccessState = document.getElementById(
    "paymentSuccessState"
);

const successReservationId = document.getElementById(
    "successReservationId"
);

const viewTicketButton = document.getElementById("viewTicketButton");

const languageButton = document.getElementById("languageButton");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");

const headerProfileImage = document.getElementById("headerProfileImage");
const headerProfileIcon = document.getElementById("headerProfileIcon");
const profileMenuImage = document.getElementById("profileMenuImage");
const profileMenuIcon = document.getElementById("profileMenuIcon");
const profileMenuName = document.getElementById("profileMenuName");
const profileMenuIdentity = document.getElementById("profileMenuIdentity");

const logoutButton = document.getElementById("logoutButton");

let pendingReservation = null;
let selectedPaymentMethod = null;
let paymentInProgress = false;

const paymentMethodNames = {
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    upay: "Upay"
};

function getPendingReservation() {
    try {
        return JSON.parse(
            sessionStorage.getItem("busLagbePendingReservation")
        );
    } catch {
        return null;
    }
}

function loadReservationSummary() {
    pendingReservation = getPendingReservation();

    if (!pendingReservation) {
        window.location.href = "booking.html";
        return;
    }

    summaryBusOperator.textContent =
        pendingReservation.operator || "Bus Operator";

    summaryBusRegistration.textContent =
        pendingReservation.registration || "Registration unavailable";

    summaryPickup.textContent =
        pendingReservation.pickup || "—";

    summaryDestination.textContent =
        pendingReservation.destination || "—";

    summarySeatCount.textContent = String(
        pendingReservation.seats || 1
    ).padStart(2, "0");

    summaryFarePerSeat.textContent =
        pendingReservation.farePerSeat || 0;

    summarySeats.textContent =
        pendingReservation.seats || 1;

    summaryTotalFare.textContent =
        pendingReservation.totalFare || 0;

    reservationId.textContent =
        pendingReservation.reservationId || "—";

    payButtonAmount.textContent =
        pendingReservation.totalFare || 0;
}

function normalizeBangladeshPhone(value) {
    return String(value || "")
        .replace(/\s+/g, "")
        .replace(/-/g, "");
}

function isValidBangladeshPhone(value) {
    const phone = normalizeBangladeshPhone(value);

    return /^(?:\+?880|0)1[3-9]\d{8}$/.test(phone);
}

function updatePayButtonState() {
    payNowButton.disabled =
        !selectedPaymentMethod ||
        !isValidBangladeshPhone(paymentPhone.value) ||
        paymentInProgress;
}

function selectPaymentMethod(button) {
    paymentMethods.forEach(method => {
        method.classList.remove("selected-payment-method");

        const radio = method.querySelector(".payment-radio");

        radio.setAttribute("data-lucide", "circle");
    });

    button.classList.add("selected-payment-method");

    const selectedRadio = button.querySelector(".payment-radio");

    selectedRadio.setAttribute(
        "data-lucide",
        "circle-check-big"
    );

    selectedPaymentMethod = button.dataset.method;

    selectedMethodName.textContent =
        paymentMethodNames[selectedPaymentMethod];

    selectedPaymentSection.classList.remove("hidden");

    paymentPhoneError.classList.add("hidden");

    updatePayButtonState();

    lucide.createIcons();

    setTimeout(() => {
        paymentPhone.focus();
    }, 100);
}

function getConfirmedReservations() {
    try {
        return JSON.parse(
            localStorage.getItem("busLagbeReservations")
        ) || [];
    } catch {
        return [];
    }
}

function saveConfirmedReservation() {
    const confirmedReservations = getConfirmedReservations();

    const confirmedReservation = {
        ...pendingReservation,
        paymentMethod: selectedPaymentMethod,
        paymentProvider:
            paymentMethodNames[selectedPaymentMethod],
        paymentPhone: normalizeBangladeshPhone(
            paymentPhone.value
        ),
        paymentStatus: "paid",
        status: "confirmed",
        paidAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString()
    };

    const existingReservationIndex =
        confirmedReservations.findIndex(
            reservation =>
                reservation.reservationId ===
                confirmedReservation.reservationId
        );

    if (existingReservationIndex !== -1) {
        confirmedReservations[existingReservationIndex] =
            confirmedReservation;
    } else {
        confirmedReservations.push(confirmedReservation);
    }

    localStorage.setItem(
    "busLagbeReservations",
    JSON.stringify(reservations)
);

if (
    typeof addBusLagbeNotification ===
    "function"
) {
    addBusLagbeNotification(
        "Reservation confirmed",
        `${ticket.operator} from ${ticket.pickup} to ${ticket.destination} has been reserved successfully.`,
        "ticket",
        "ticket.html"
    );

    addBusLagbeNotification(
        "Payment successful",
        `Your payment of ৳${ticket.totalFare} was completed successfully.`,
        "payment",
        "ticket.html"
    );
}

    localStorage.setItem(
        "busLagbeLatestTicket",
        JSON.stringify(confirmedReservation)
    );

    addBookingNotification(confirmedReservation);

    sessionStorage.removeItem("busLagbePendingReservation");

    return confirmedReservation;
}

function addBookingNotification(reservation) {
    let notifications = [];

    try {
        notifications = JSON.parse(
            localStorage.getItem("busLagbeNotifications")
        ) || [];
    } catch {
        notifications = [];
    }

    notifications.push({
        id: `NOTIFICATION-${Date.now()}`,
        title: "Reservation confirmed",
        message:
            `${reservation.operator}: ` +
            `${reservation.pickup} to ` +
            `${reservation.destination} for ` +
            `${reservation.seats} seat` +
            `${reservation.seats > 1 ? "s" : ""}.`,
        read: false,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem(
        "busLagbeNotifications",
        JSON.stringify(notifications)
    );
}

function showPaymentProcessing() {
    paymentInProgress = true;

    updatePayButtonState();

    paymentStatusOverlay.classList.remove("hidden");

    paymentProcessingState.classList.remove("hidden");
    paymentSuccessState.classList.add("hidden");

    document.body.classList.add("payment-modal-open");

    requestAnimationFrame(() => {
        paymentStatusOverlay.classList.add(
            "payment-status-visible"
        );
    });

    lucide.createIcons();
}

function showPaymentSuccess(confirmedReservation) {
    paymentProcessingState.classList.add("hidden");

    paymentSuccessState.classList.remove("hidden");

    successReservationId.textContent =
        confirmedReservation.reservationId;

    paymentStatusOverlay.classList.add("payment-success-visible");

    lucide.createIcons();
}

function processDemoPayment() {
    if (paymentInProgress) {
        return;
    }

    if (!selectedPaymentMethod) {
        return;
    }

    if (!isValidBangladeshPhone(paymentPhone.value)) {
        paymentPhoneError.classList.remove("hidden");

        paymentPhone.focus();

        return;
    }

    paymentPhoneError.classList.add("hidden");

    showPaymentProcessing();

    setTimeout(() => {
        const confirmedReservation =
            saveConfirmedReservation();

        showPaymentSuccess(confirmedReservation);
    }, 2600);
}

function loadCurrentUser() {
    try {
        const currentUser = JSON.parse(
            localStorage.getItem("busLagbeCurrentUser")
        );

        if (!currentUser) {
            return;
        }

        profileMenuName.textContent =
            currentUser.name ||
            currentUser.displayName ||
            "Passenger";

        profileMenuIdentity.textContent =
            currentUser.email ||
            currentUser.phone ||
            "Bus Lagbe Account";

        if (currentUser.photoURL) {
            headerProfileImage.src = currentUser.photoURL;
            profileMenuImage.src = currentUser.photoURL;

            headerProfileImage.classList.remove("hidden");
            profileMenuImage.classList.remove("hidden");

            headerProfileIcon.classList.add("hidden");
            profileMenuIcon.classList.add("hidden");
        }
    } catch (error) {
        console.error("User profile loading error:", error);
    }
}

paymentMethods.forEach(method => {
    method.addEventListener("click", () => {
        selectPaymentMethod(method);
    });
});

paymentPhone.addEventListener("input", () => {
    paymentPhoneError.classList.add("hidden");

    updatePayButtonState();
});

paymentPhone.addEventListener("blur", () => {
    if (
        paymentPhone.value &&
        !isValidBangladeshPhone(paymentPhone.value)
    ) {
        paymentPhoneError.classList.remove("hidden");
    }
});

payNowButton.addEventListener("click", processDemoPayment);

viewTicketButton.addEventListener("click", () => {
    window.location.href = "ticket.html";
});

profileButton.addEventListener("click", event => {
    event.stopPropagation();

    profileMenu.classList.toggle("show");
});

profileMenu.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    profileMenu.classList.remove("show");
});

languageButton.addEventListener("click", () => {
    const currentLanguage =
        localStorage.getItem("busLagbeLanguage") || "en";

    const nextLanguage =
        currentLanguage === "en" ? "bn" : "en";

    localStorage.setItem(
        "busLagbeLanguage",
        nextLanguage
    );
});

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("busLagbeCurrentUser");

    window.location.href = "index.html";
});

window.addEventListener("DOMContentLoaded", () => {
    loadReservationSummary();
    loadCurrentUser();

    lucide.createIcons();
});
