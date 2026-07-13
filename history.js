const historyTableBody = document.getElementById(
    "historyTableBody"
);

const historyEmpty = document.getElementById(
    "historyEmpty"
);

const historySearch = document.getElementById(
    "historySearch"
);

const totalReservations = document.getElementById(
    "totalReservations"
);

const totalSeats = document.getElementById(
    "totalSeats"
);

const totalSpent = document.getElementById(
    "totalSpent"
);

const profileButton = document.getElementById(
    "profileButton"
);

const profileMenu = document.getElementById(
    "profileMenu"
);

const profileMenuName = document.getElementById(
    "profileMenuName"
);

const profileMenuIdentity = document.getElementById(
    "profileMenuIdentity"
);

const headerProfileImage = document.getElementById(
    "headerProfileImage"
);

const headerProfileIcon = document.getElementById(
    "headerProfileIcon"
);

const logoutButton = document.getElementById(
    "logoutButton"
);

let reservations = [];

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

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function updateSummary() {
    totalReservations.textContent =
        reservations.length;

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

    totalSeats.textContent = seats;

    totalSpent.textContent =
        spent.toLocaleString("en-BD");
}

function openTicket(reservationId) {
    const reservation = reservations.find(
        item =>
            item.reservationId === reservationId
    );

    if (!reservation) {
        return;
    }

    localStorage.setItem(
        "busLagbeSelectedTicket",
        JSON.stringify(reservation)
    );

    window.location.href = "ticket.html";
}

function renderHistory(items) {
    historyTableBody.innerHTML = "";

    if (!items.length) {
        historyEmpty.classList.remove("hidden");
        return;
    }

    historyEmpty.classList.add("hidden");

    items.forEach(reservation => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong class="reservation-id">
                    ${reservation.reservationId || "—"}
                </strong>
            </td>

            <td>
                <div class="operator-cell">
                    <span class="operator-icon">
                        <i data-lucide="bus-front"></i>
                    </span>

                    <div>
                        <strong>
                            ${reservation.operator || "Bus Operator"}
                        </strong>

                        <span>
                            ${reservation.registration || "—"}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                <div class="route-cell">
                    <strong>
                        ${reservation.pickup || "—"}
                    </strong>

                    <i data-lucide="arrow-right"></i>

                    <strong>
                        ${reservation.destination || "—"}
                    </strong>
                </div>
            </td>

            <td>
                <span class="seat-count">
                    ${String(
                        reservation.seats || 1
                    ).padStart(2, "0")}
                </span>
            </td>

            <td>
                <strong class="paid-amount">
                    ৳${Number(
                        reservation.totalFare || 0
                    ).toLocaleString("en-BD")}
                </strong>
            </td>

            <td>
                ${formatDate(
                    reservation.confirmedAt ||
                    reservation.paidAt
                )}
            </td>

            <td>
                <button
                    class="view-history-ticket"
                    data-reservation-id="${reservation.reservationId}"
                    type="button"
                >
                    <i data-lucide="arrow-up-right"></i>
                </button>
            </td>
        `;

        historyTableBody.appendChild(row);
    });

    document
        .querySelectorAll(".view-history-ticket")
        .forEach(button => {
            button.addEventListener("click", () => {
                openTicket(
                    button.dataset.reservationId
                );
            });
        });

    lucide.createIcons();
}

function filterHistory() {
    const query = historySearch.value
        .trim()
        .toLowerCase();

    const filteredReservations =
        reservations.filter(reservation => {
            const searchableText = `
                ${reservation.reservationId || ""}
                ${reservation.operator || ""}
                ${reservation.registration || ""}
                ${reservation.pickup || ""}
                ${reservation.destination || ""}
            `.toLowerCase();

            return searchableText.includes(query);
        });

    renderHistory(filteredReservations);
}

function loadCurrentUser() {
    try {
        const user = JSON.parse(
            localStorage.getItem(
                "busLagbeCurrentUser"
            )
        );

        if (!user) {
            return;
        }

        profileMenuName.textContent =
            user.name ||
            user.displayName ||
            "Passenger";

        profileMenuIdentity.textContent =
            user.email ||
            user.phone ||
            "Bus Lagbe Account";

        if (user.photoURL) {
            headerProfileImage.src = user.photoURL;

            headerProfileImage.classList.remove(
                "hidden"
            );

            headerProfileIcon.classList.add(
                "hidden"
            );
        }
    } catch {
        return;
    }
}

historySearch.addEventListener(
    "input",
    filterHistory
);

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

logoutButton.addEventListener("click", () => {
    localStorage.removeItem(
        "busLagbeCurrentUser"
    );

    window.location.href = "index.html";
});

window.addEventListener("DOMContentLoaded", () => {
    reservations = getReservations();

    updateSummary();

    renderHistory(reservations);

    loadCurrentUser();

    lucide.createIcons();
});
