const digitalTicket = document.getElementById("digitalTicket");

const ticketReservationId = document.getElementById(
    "ticketReservationId"
);

const ticketBusOperator = document.getElementById(
    "ticketBusOperator"
);

const ticketBusRegistration = document.getElementById(
    "ticketBusRegistration"
);

const ticketPickup = document.getElementById("ticketPickup");

const ticketDestination = document.getElementById(
    "ticketDestination"
);

const ticketPickupTime = document.getElementById(
    "ticketPickupTime"
);

const ticketDestinationTime = document.getElementById(
    "ticketDestinationTime"
);

const ticketPaymentMethod = document.getElementById(
    "ticketPaymentMethod"
);

const ticketTotalPaid = document.getElementById(
    "ticketTotalPaid"
);

const ticketBookedDate = document.getElementById(
    "ticketBookedDate"
);

const ticketSeatCount = document.getElementById(
    "ticketSeatCount"
);

const ticketFarePerSeat = document.getElementById(
    "ticketFarePerSeat"
);

const downloadTicketButton = document.getElementById(
    "downloadTicketButton"
);

const printTicketButton = document.getElementById(
    "printTicketButton"
);

const downloadStatus = document.getElementById(
    "downloadStatus"
);

const languageButton = document.getElementById(
    "languageButton"
);

const profileButton = document.getElementById(
    "profileButton"
);

const profileMenu = document.getElementById(
    "profileMenu"
);

const headerProfileImage = document.getElementById(
    "headerProfileImage"
);

const headerProfileIcon = document.getElementById(
    "headerProfileIcon"
);

const profileMenuImage = document.getElementById(
    "profileMenuImage"
);

const profileMenuIcon = document.getElementById(
    "profileMenuIcon"
);

const profileMenuName = document.getElementById(
    "profileMenuName"
);

const profileMenuIdentity = document.getElementById(
    "profileMenuIdentity"
);

const logoutButton = document.getElementById(
    "logoutButton"
);

let currentTicket = null;
let downloadingTicket = false;

function getLatestTicket() {
    try {
        return JSON.parse(
            localStorage.getItem("busLagbeLatestTicket")
        );
    } catch {
        return null;
    }
}

function formatTicketDate(value) {
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

function getTicketTime(ticket, type) {
    const possiblePickupFields = [
        "pickupTime",
        "departureTime",
        "pickupArrivalTime",
        "startTime"
    ];

    const possibleDestinationFields = [
        "destinationTime",
        "arrivalTime",
        "destinationArrivalTime",
        "endTime"
    ];

    const fields =
        type === "pickup"
            ? possiblePickupFields
            : possibleDestinationFields;

    for (const field of fields) {
        if (ticket[field]) {
            return ticket[field];
        }
    }

    return "Time as scheduled";
}

function loadTicket() {
    currentTicket = getLatestTicket();

    if (!currentTicket) {
        window.location.href = "tickets.html";
        return;
    }

    ticketReservationId.textContent =
        currentTicket.reservationId || "—";

    ticketBusOperator.textContent =
        currentTicket.operator || "Bus Operator";

    ticketBusRegistration.textContent =
        currentTicket.registration ||
        "Registration unavailable";

    ticketPickup.textContent =
        currentTicket.pickup || "—";

    ticketDestination.textContent =
        currentTicket.destination || "—";

    ticketPickupTime.textContent =
        getTicketTime(currentTicket, "pickup");

    ticketDestinationTime.textContent =
        getTicketTime(currentTicket, "destination");

    ticketPaymentMethod.textContent =
        currentTicket.paymentProvider ||
        currentTicket.paymentMethod ||
        "Digital Payment";

    ticketTotalPaid.textContent =
        currentTicket.totalFare || 0;

    ticketBookedDate.textContent =
        formatTicketDate(
            currentTicket.confirmedAt ||
            currentTicket.paidAt
        );

    ticketSeatCount.textContent = String(
        currentTicket.seats || 1
    ).padStart(2, "0");

    ticketFarePerSeat.textContent =
        currentTicket.farePerSeat || 0;

    document.title =
        `${currentTicket.reservationId || "Ticket"} | Bus Lagbe?`;
}

function sanitizeFileName(value) {
    return String(value || "ticket")
        .replace(/[^a-z0-9-_]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function downloadTicket() {
    if (downloadingTicket || !currentTicket) {
        return;
    }

    downloadingTicket = true;

    downloadTicketButton.disabled = true;

    const originalButtonContent =
        downloadTicketButton.innerHTML;

    downloadTicketButton.innerHTML = `
        <span class="ticket-button-loader"></span>
        <span>Preparing Ticket</span>
    `;

    try {
        const canvas = await html2canvas(digitalTicket, {
            scale: 2.5,
            backgroundColor: "#ffffff",
            useCORS: true,
            logging: false
        });

        const image = canvas.toDataURL("image/png", 1);

        const downloadLink = document.createElement("a");

        const reservationName = sanitizeFileName(
            currentTicket.reservationId
        );

        downloadLink.download =
            `Bus-Lagbe-${reservationName}.png`;

        downloadLink.href = image;

        document.body.appendChild(downloadLink);

        downloadLink.click();

        downloadLink.remove();

        downloadStatus.classList.remove("hidden");

        setTimeout(() => {
            downloadStatus.classList.add("hidden");
        }, 3500);
    } catch (error) {
        console.error("Ticket download error:", error);

        alert(
            "We could not download your ticket. Please try again."
        );
    } finally {
        downloadingTicket = false;

        downloadTicketButton.disabled = false;

        downloadTicketButton.innerHTML =
            originalButtonContent;

        lucide.createIcons();
    }
}

function printTicket() {
    if (!currentTicket || !digitalTicket) {
        return;
    }

    const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800"
    );

    if (!printWindow) {
        alert("Please allow pop-ups to print your ticket.");
        return;
    }

    const ticketStyles = Array.from(
        document.querySelectorAll(
            'link[rel="stylesheet"], style'
        )
    )
        .map(style => style.outerHTML)
        .join("");

    const ticketHTML = digitalTicket.outerHTML;

    printWindow.document.open();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Bus Lagbe Ticket - ${currentTicket.reservationId || "Reservation"}
            </title>

            ${ticketStyles}

            <style>

                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                }

                body {
                    padding: 20px;
                    font-family: "Inter", sans-serif;
                }

                .print-ticket-container {
                    width: 100%;
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .digital-ticket {
                    width: 100% !important;
                    min-height: 590px !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                    print-color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                }

                @media print {

                    html,
                    body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        padding: 0;
                    }

                    .print-ticket-container {
                        width: 100%;
                        max-width: none;
                        margin: 0;
                    }

                    .digital-ticket {
                        width: 100% !important;
                        box-shadow: none !important;
                    }

                }

            </style>

        </head>

        <body>

            <div class="print-ticket-container">

                ${ticketHTML}

            </div>

        </body>

        </html>
    `);

    printWindow.document.close();

    let printStarted = false;

    function startPrint() {
        if (printStarted) {
            return;
        }

        printStarted = true;

        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 800);
    }

    printWindow.addEventListener("afterprint", () => {
        printWindow.close();
    });

    printWindow.addEventListener("load", startPrint);

    setTimeout(startPrint, 1500);
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
            headerProfileImage.src =
                currentUser.photoURL;

            profileMenuImage.src =
                currentUser.photoURL;

            headerProfileImage.classList.remove(
                "hidden"
            );

            profileMenuImage.classList.remove(
                "hidden"
            );

            headerProfileIcon.classList.add(
                "hidden"
            );

            profileMenuIcon.classList.add(
                "hidden"
            );
        }
    } catch (error) {
        console.error(
            "User profile loading error:",
            error
        );
    }
}

downloadTicketButton.addEventListener(
    "click",
    downloadTicket
);

printTicketButton.addEventListener(
    "click",
    printTicket
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

languageButton.addEventListener("click", () => {
    const currentLanguage =
        localStorage.getItem("busLagbeLanguage") ||
        "en";

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
    loadTicket();

    loadCurrentUser();

    lucide.createIcons();
});
