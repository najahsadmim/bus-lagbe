const CSV_FILE = "dhaka_city_buses.csv";

const pickupLocation = document.getElementById("pickupLocation");
const destinationLocation = document.getElementById("destinationLocation");
const findBusesButton = document.getElementById("findBusesButton");
const searchHelper = document.getElementById("searchHelper");

const busResultsSection = document.getElementById("busResultsSection");
const busResultsList = document.getElementById("busResultsList");
const noResultsState = document.getElementById("noResultsState");
const searchAgainButton = document.getElementById("searchAgainButton");

const resultsPickup = document.getElementById("resultsPickup");
const resultsDestination = document.getElementById("resultsDestination");
const resultCount = document.getElementById("resultCount");

const busCardTemplate = document.getElementById("busCardTemplate");

const reservationOverlay = document.getElementById("reservationOverlay");
const reservationPanel = document.getElementById("reservationPanel");
const closeReservationPanelButton = document.getElementById(
    "closeReservationPanel"
);

const selectedBusOperator = document.getElementById("selectedBusOperator");
const selectedBusRegistration = document.getElementById(
    "selectedBusRegistration"
);
const selectedPickup = document.getElementById("selectedPickup");
const selectedDestination = document.getElementById("selectedDestination");

const decreaseSeatsButton = document.getElementById("decreaseSeatsButton");
const increaseSeatsButton = document.getElementById("increaseSeatsButton");

const seatCount = document.getElementById("seatCount");
const selectedSeatCount = document.getElementById("selectedSeatCount");
const farePerSeat = document.getElementById("farePerSeat");
const totalFare = document.getElementById("totalFare");

const confirmReservationButton = document.getElementById(
    "confirmReservationButton"
);

const notificationButton = document.getElementById("notificationButton");
const notificationPanel = document.getElementById("notificationPanel");
const notificationDot = document.getElementById("notificationDot");
const notificationList = document.getElementById("notificationList");
const markAllReadButton = document.getElementById("markAllReadButton");

const languageButton = document.getElementById("languageButton");
const languageMenu = document.getElementById("languageMenu");

const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");

const headerProfileImage = document.getElementById("headerProfileImage");
const headerProfileIcon = document.getElementById("headerProfileIcon");
const profileMenuImage = document.getElementById("profileMenuImage");
const profileMenuIcon = document.getElementById("profileMenuIcon");
const profileMenuName = document.getElementById("profileMenuName");
const profileMenuIdentity = document.getElementById("profileMenuIdentity");

const logoutButton = document.getElementById("logoutButton");

const sortButtons = document.querySelectorAll(".sort-button");

let busData = [];
let matchedBuses = [];
let selectedBus = null;
let currentSeatCount = 1;
let currentSort = "fare";

function normalizeLocation(value) {
    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");
}

function normalizeLocationKey(value) {
    return normalizeLocation(value).toLowerCase();
}

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let index = 0; index < text.length; index++) {
        const character = text[index];
        const nextCharacter = text[index + 1];

        if (character === '"' && insideQuotes && nextCharacter === '"') {
            value += '"';
            index++;
            continue;
        }

        if (character === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (character === "," && !insideQuotes) {
            row.push(value);
            value = "";
            continue;
        }

        if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {
            if (character === "\r" && nextCharacter === "\n") {
                index++;
            }

            row.push(value);

            if (row.some(cell => cell.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";

            continue;
        }

        value += character;
    }

    row.push(value);

    if (row.some(cell => cell.trim() !== "")) {
        rows.push(row);
    }

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(header =>
        header.trim().replace(/\ufeff/g, "")
    );

    return rows.slice(1).map(columns => {
        const object = {};

        headers.forEach((header, index) => {
            object[header] = columns[index]?.trim() || "";
        });

        return object;
    });
}

function isRouteDescription(value) {
    const normalized = normalizeLocationKey(value);

    return (
        normalized.includes("no local stops") ||
        normalized.includes("direct highway") ||
        normalized.includes("direct via highway") ||
        normalized === "expressways"
    );
}

function parseMajorStops(value) {
    return String(value || "")
        .split(",")
        .map(stop => normalizeLocation(stop))
        .filter(stop => stop && !isRouteDescription(stop));
}

function buildBusRoute(row) {
    const pickup = normalizeLocation(row["Primary Pickup"]);
    const stops = parseMajorStops(row["Major Stops"]);
    const destination = normalizeLocation(row["Final Drop-off"]);

    const route = [
        pickup,
        ...stops,
        destination
    ].filter(Boolean);

    const uniqueRoute = [];

    route.forEach(location => {
        const locationKey = normalizeLocationKey(location);

        const alreadyExists = uniqueRoute.some(
            existingLocation =>
                normalizeLocationKey(existingLocation) === locationKey
        );

        if (!alreadyExists) {
            uniqueRoute.push(location);
        }
    });

    return uniqueRoute;
}

function formatBusRow(row, index) {
    const route = buildBusRoute(row);

    return {
        id: `BUS-${String(index + 1).padStart(3, "0")}`,
        operator: normalizeLocation(row["Bus Operator"]),
        category: normalizeLocation(row["Category"]),
        registration: normalizeLocation(row["Registration No."]),
        route,
        primaryPickup: normalizeLocation(row["Primary Pickup"]),
        finalDestination: normalizeLocation(row["Final Drop-off"]),
        departureTime: normalizeLocation(row["Departure Time"]),
        arrivalTime: normalizeLocation(row["Arrival Time"]),
        totalSeats: Number(row["Total Seats"]) || 0,
        availableSeats: Number(row["Available Seats"]) || 0,
        fare: Number(row["Fare"]) || 0
    };
}

async function loadBusData() {
    try {
        searchHelper.classList.add("loading-route-data");

        const response = await fetch(CSV_FILE);

        if (!response.ok) {
            throw new Error(
                `Could not load ${CSV_FILE}. Status: ${response.status}`
            );
        }

        const csvText = await response.text();
        const parsedRows = parseCSV(csvText);

        busData = parsedRows
            .map(formatBusRow)
            .filter(bus => bus.route.length >= 2);

        if (!busData.length) {
            throw new Error("No usable bus routes found.");
        }

        populatePickupLocations();

        searchHelper.classList.remove("loading-route-data");

        console.log("Bus Lagbe route data:", busData);
    } catch (error) {
        console.error("Bus data loading error:", error);

        searchHelper.classList.remove("loading-route-data");

        searchHelper.innerHTML = `
            <i data-lucide="circle-alert"></i>
            <span>
                Bus route data could not be loaded. Check dhaka_city_buses.csv.
            </span>
        `;

        lucide.createIcons();
    }
}

function getUniqueLocations(locations) {
    const locationMap = new Map();

    locations.forEach(location => {
        const cleanedLocation = normalizeLocation(location);

        if (!cleanedLocation) {
            return;
        }

        const key = normalizeLocationKey(cleanedLocation);

        if (!locationMap.has(key)) {
            locationMap.set(key, cleanedLocation);
        }
    });

    return Array.from(locationMap.values()).sort((first, second) =>
        first.localeCompare(second)
    );
}

function populatePickupLocations() {
    const pickupLocations = getUniqueLocations(
        busData.flatMap(bus => bus.route.slice(0, -1))
    );

    pickupLocation.innerHTML = `
        <option value="">
            Select pickup
        </option>
    `;

    pickupLocations.forEach(location => {
        const option = document.createElement("option");

        option.value = location;
        option.textContent = location;

        pickupLocation.appendChild(option);
    });
}

function getDestinationsForPickup(selectedPickup) {
    const destinations = [];

    busData.forEach(bus => {
        const pickupIndex = bus.route.findIndex(
            location =>
                normalizeLocationKey(location) ===
                normalizeLocationKey(selectedPickup)
        );

        if (pickupIndex === -1) {
            return;
        }

        bus.route
            .slice(pickupIndex + 1)
            .forEach(location => destinations.push(location));
    });

    return getUniqueLocations(destinations);
}

function populateDestinationLocations(selectedPickup) {
    const destinations = getDestinationsForPickup(selectedPickup);

    destinationLocation.innerHTML = `
        <option value="">
            Select destination
        </option>
    `;

    destinations.forEach(location => {
        const option = document.createElement("option");

        option.value = location;
        option.textContent = location;

        destinationLocation.appendChild(option);
    });

    destinationLocation.disabled = destinations.length === 0;
}

function busMatchesJourney(bus, pickup, destination) {
    const pickupIndex = bus.route.findIndex(
        location =>
            normalizeLocationKey(location) ===
            normalizeLocationKey(pickup)
    );

    const destinationIndex = bus.route.findIndex(
        location =>
            normalizeLocationKey(location) ===
            normalizeLocationKey(destination)
    );

    return (
        pickupIndex !== -1 &&
        destinationIndex !== -1 &&
        pickupIndex < destinationIndex
    );
}

function getJourneyRoute(bus, pickup, destination) {
    const pickupIndex = bus.route.findIndex(
        location =>
            normalizeLocationKey(location) ===
            normalizeLocationKey(pickup)
    );

    const destinationIndex = bus.route.findIndex(
        location =>
            normalizeLocationKey(location) ===
            normalizeLocationKey(destination)
    );

    return bus.route.slice(
        pickupIndex,
        destinationIndex + 1
    );
}

function parseTimeToMinutes(value) {
    const match = String(value || "")
        .trim()
        .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!match) {
        return Number.MAX_SAFE_INTEGER;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (hours === 12) {
        hours = 0;
    }

    if (period === "PM") {
        hours += 12;
    }

    return hours * 60 + minutes;
}

function sortMatchedBuses() {
    matchedBuses.sort((firstBus, secondBus) => {
        if (currentSort === "time") {
            return (
                parseTimeToMinutes(firstBus.arrivalTime) -
                parseTimeToMinutes(secondBus.arrivalTime)
            );
        }

        return firstBus.fare - secondBus.fare;
    });
}

function createRouteStopElement(
    stop,
    index,
    route,
    pickup,
    destination
) {
    const stopElement = document.createElement("div");

    stopElement.className = "route-stop-item";

    const stopKey = normalizeLocationKey(stop);
    const pickupKey = normalizeLocationKey(pickup);
    const destinationKey = normalizeLocationKey(destination);

    if (stopKey === pickupKey) {
        stopElement.classList.add("user-pickup-stop");
    }

    if (stopKey === destinationKey) {
        stopElement.classList.add("user-destination-stop");
    }

    const isLastStop = index === route.length - 1;

    stopElement.innerHTML = `
        <div class="route-stop-marker">
            <span></span>
            ${isLastStop ? "" : "<div></div>"}
        </div>

        <div class="route-stop-name">
            <strong>${escapeHTML(stop)}</strong>

            <span>
                ${
                    stopKey === pickupKey
                        ? "Your pickup"
                        : stopKey === destinationKey
                            ? "Your destination"
                            : "Bus stop"
                }
            </span>
        </div>
    `;

    return stopElement;
}

function updateAvailabilityCard(card, bus) {
    const badge = card.querySelector(".availability-badge");
    const badgeText = badge.querySelector("strong");
    const bookButton = card.querySelector(".book-bus-button");

    if (bus.availableSeats <= 0) {
        badge.classList.add("unavailable-badge");

        badgeText.textContent = "Unavailable";

        bookButton.disabled = true;

        bookButton.innerHTML = `
            <span>Sold Out</span>
        `;

        return;
    }

    badgeText.textContent = `${bus.availableSeats} seats left`;
}

function renderBusResults() {
    busResultsList.innerHTML = "";

    sortMatchedBuses();

    resultCount.textContent = matchedBuses.length;

    if (!matchedBuses.length) {
        noResultsState.classList.remove("hidden");
        busResultsList.classList.add("hidden");

        lucide.createIcons();

        return;
    }

    noResultsState.classList.add("hidden");
    busResultsList.classList.remove("hidden");

    const pickup = pickupLocation.value;
    const destination = destinationLocation.value;

    matchedBuses.forEach((bus, index) => {
        const cardFragment = busCardTemplate.content.cloneNode(true);
        const card = cardFragment.querySelector(".bus-result-card");

        card.dataset.busId = bus.id;

        card.querySelector(".bus-operator-name").textContent =
            bus.operator;

        card.querySelector(".bus-registration").textContent =
            bus.registration;

        card.querySelector(".pickup-time").textContent =
            bus.departureTime;

        card.querySelector(".destination-time").textContent =
            bus.arrivalTime;

        card.querySelector(".card-pickup-location").textContent =
            `Route departure · ${bus.primaryPickup}`;

        card.querySelector(".card-destination-location").textContent =
            `Final arrival · ${bus.finalDestination}`;

        card.querySelector(".bus-fare-value").textContent =
            bus.fare;

        const expandedRoute = card.querySelector(".expanded-route");
        const routeStopsList = card.querySelector(".route-stops-list");
        const viewRouteButton = card.querySelector(".view-route-button");
        const closeRouteButton = card.querySelector(".close-route-button");
        const bookBusButton = card.querySelector(".book-bus-button");

        const journeyRoute = getJourneyRoute(
            bus,
            pickup,
            destination
        );

        journeyRoute.forEach((stop, routeIndex) => {
            routeStopsList.appendChild(
                createRouteStopElement(
                    stop,
                    routeIndex,
                    journeyRoute,
                    pickup,
                    destination
                )
            );
        });

        updateAvailabilityCard(card, bus);

        viewRouteButton.addEventListener("click", () => {
            expandedRoute.classList.toggle("hidden");

            card.classList.toggle(
                "route-expanded",
                !expandedRoute.classList.contains("hidden")
            );

            lucide.createIcons();
        });

        closeRouteButton.addEventListener("click", () => {
            expandedRoute.classList.add("hidden");
            card.classList.remove("route-expanded");
        });

        bookBusButton.addEventListener("click", () => {
            if (bus.availableSeats > 0) {
                openReservationPanel(bus);
            }
        });

        card.style.animationDelay = `${index * 90}ms`;

        busResultsList.appendChild(cardFragment);
    });

    lucide.createIcons();
}

function findMatchingBuses() {
    const pickup = pickupLocation.value;
    const destination = destinationLocation.value;

    if (!pickup || !destination) {
        return;
    }

    matchedBuses = busData.filter(bus =>
        busMatchesJourney(bus, pickup, destination)
    );

    resultsPickup.textContent = pickup;
    resultsDestination.textContent = destination;

    busResultsSection.classList.remove("hidden");

    renderBusResults();

    setTimeout(() => {
        busResultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 100);
}

function updateSeatSummary() {
    if (!selectedBus) {
        return;
    }

    seatCount.textContent = String(currentSeatCount).padStart(2, "0");

    selectedSeatCount.textContent = currentSeatCount;

    farePerSeat.textContent = selectedBus.fare;

    totalFare.textContent =
        selectedBus.fare * currentSeatCount;

    decreaseSeatsButton.disabled = currentSeatCount <= 1;

    increaseSeatsButton.disabled =
        currentSeatCount >= selectedBus.availableSeats;
}

function openReservationPanel(bus) {
    selectedBus = bus;
    currentSeatCount = 1;

    selectedBusOperator.textContent = bus.operator;
    selectedBusRegistration.textContent = bus.registration;

    selectedPickup.textContent = pickupLocation.value;
    selectedDestination.textContent = destinationLocation.value;

    updateSeatSummary();

    reservationOverlay.classList.remove("hidden");

    requestAnimationFrame(() => {
        reservationOverlay.classList.add("overlay-visible");
        reservationPanel.classList.add("panel-visible");
    });

    document.body.classList.add("reservation-open");
}

function closeReservationPanel() {
    reservationOverlay.classList.remove("overlay-visible");
    reservationPanel.classList.remove("panel-visible");

    document.body.classList.remove("reservation-open");

    setTimeout(() => {
        reservationOverlay.classList.add("hidden");
    }, 350);
}

function generateReservationId() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let index = 0; index < 6; index++) {
        code += characters[
            Math.floor(Math.random() * characters.length)
        ];
    }

    return `BL-${code}`;
}

function savePendingReservation() {
    if (!selectedBus) {
        return;
    }

    const reservation = {
        reservationId: generateReservationId(),
        busId: selectedBus.id,
        operator: selectedBus.operator,
        category: selectedBus.category,
        registration: selectedBus.registration,
        pickup: pickupLocation.value,
        destination: destinationLocation.value,
        routeDeparture: selectedBus.departureTime,
        finalArrival: selectedBus.arrivalTime,
        primaryPickup: selectedBus.primaryPickup,
        finalDestination: selectedBus.finalDestination,
        route: getJourneyRoute(
            selectedBus,
            pickupLocation.value,
            destinationLocation.value
        ),
        farePerSeat: selectedBus.fare,
        seats: currentSeatCount,
        totalFare: selectedBus.fare * currentSeatCount,
        status: "pending_payment",
        createdAt: new Date().toISOString()
    };

    sessionStorage.setItem(
        "busLagbePendingReservation",
        JSON.stringify(reservation)
    );

    window.location.href = "payment.html";
}

function getNotifications() {
    try {
        return JSON.parse(
            localStorage.getItem("busLagbeNotifications")
        ) || [];
    } catch {
        return [];
    }
}

function saveNotifications(notifications) {
    localStorage.setItem(
        "busLagbeNotifications",
        JSON.stringify(notifications)
    );
}

function formatNotificationTime(dateValue) {
    const date = new Date(dateValue);
    const now = new Date();
    const difference = now - date;

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    if (days === 1) {
        return "Yesterday";
    }

    return `${days} days ago`;
}

function renderNotifications() {
    const notifications = getNotifications();

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    notificationDot.classList.toggle(
        "hidden",
        unreadCount === 0
    );

    if (!notifications.length) {
        notificationList.innerHTML = `
            <div class="empty-notifications">
                <i data-lucide="bell-off"></i>
                <p>No notifications yet.</p>
            </div>
        `;

        lucide.createIcons();

        return;
    }

    notificationList.innerHTML = "";

    notifications
        .slice()
        .reverse()
        .slice(0, 6)
        .forEach(notification => {
            const item = document.createElement("div");

            item.className = "notification-item";

            if (!notification.read) {
                item.classList.add("unread-notification");
            }

            item.innerHTML = `
                <span class="notification-status-dot"></span>

                <div>
                    <strong>
                        ${escapeHTML(notification.title)}
                    </strong>

                    <p>
                        ${escapeHTML(notification.message)}
                    </p>

                    <span>
                        ${formatNotificationTime(notification.createdAt)}
                    </span>
                </div>
            `;

            item.addEventListener("click", () => {
                notification.read = true;

                saveNotifications(notifications);
                renderNotifications();
            });

            notificationList.appendChild(item);
        });

    lucide.createIcons();
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

function closeHeaderMenus() {
    notificationPanel.classList.remove("show");
    languageMenu.classList.remove("show");
    profileMenu.classList.remove("show");
}

pickupLocation.addEventListener("change", () => {
    destinationLocation.value = "";

    findBusesButton.disabled = true;

    busResultsSection.classList.add("hidden");

    if (!pickupLocation.value) {
        destinationLocation.disabled = true;

        destinationLocation.innerHTML = `
            <option value="">
                Select destination
            </option>
        `;

        return;
    }

    populateDestinationLocations(pickupLocation.value);
});

destinationLocation.addEventListener("change", () => {
    findBusesButton.disabled =
        !pickupLocation.value ||
        !destinationLocation.value;
});

findBusesButton.addEventListener("click", findMatchingBuses);

searchAgainButton.addEventListener("click", () => {
    busResultsSection.classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

sortButtons.forEach(button => {
    button.addEventListener("click", () => {
        sortButtons.forEach(item =>
            item.classList.remove("active-sort")
        );

        button.classList.add("active-sort");

        currentSort = button.dataset.sort;

        renderBusResults();
    });
});

decreaseSeatsButton.addEventListener("click", () => {
    if (currentSeatCount <= 1) {
        return;
    }

    currentSeatCount--;

    updateSeatSummary();
});

increaseSeatsButton.addEventListener("click", () => {
    if (
        !selectedBus ||
        currentSeatCount >= selectedBus.availableSeats
    ) {
        return;
    }

    currentSeatCount++;

    updateSeatSummary();
});

closeReservationPanelButton.addEventListener(
    "click",
    closeReservationPanel
);

reservationOverlay.addEventListener(
    "click",
    closeReservationPanel
);

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        reservationPanel.classList.contains("panel-visible")
    ) {
        closeReservationPanel();
    }
});

confirmReservationButton.addEventListener(
    "click",
    savePendingReservation
);

notificationButton.addEventListener("click", event => {
    event.stopPropagation();

    const shouldOpen =
        !notificationPanel.classList.contains("show");

    closeHeaderMenus();

    if (shouldOpen) {
        notificationPanel.classList.add("show");
    }
});

languageButton.addEventListener("click", event => {
    event.stopPropagation();

    const shouldOpen =
        !languageMenu.classList.contains("show");

    closeHeaderMenus();

    if (shouldOpen) {
        languageMenu.classList.add("show");
    }
});

profileButton.addEventListener("click", event => {
    event.stopPropagation();

    const shouldOpen =
        !profileMenu.classList.contains("show");

    closeHeaderMenus();

    if (shouldOpen) {
        profileMenu.classList.add("show");
    }
});

[
    notificationPanel,
    languageMenu,
    profileMenu
].forEach(menu => {
    menu.addEventListener("click", event => {
        event.stopPropagation();
    });
});

document.addEventListener("click", closeHeaderMenus);

markAllReadButton.addEventListener("click", () => {
    const notifications = getNotifications();

    notifications.forEach(notification => {
        notification.read = true;
    });

    saveNotifications(notifications);
    renderNotifications();
});

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("busLagbeCurrentUser");

    window.location.href = "index.html";
});

window.addEventListener("DOMContentLoaded", async () => {
    loadCurrentUser();
    renderNotifications();

    await loadBusData();

    lucide.createIcons();
});
