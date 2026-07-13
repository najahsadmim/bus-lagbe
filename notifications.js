const notificationButton = document.getElementById(
    "notificationButton"
);

const notificationPanel = document.getElementById(
    "notificationPanel"
);

const notificationBadge = document.getElementById(
    "notificationBadge"
);

const notificationList = document.getElementById(
    "notificationList"
);

const markAllReadButton = document.getElementById(
    "markAllReadButton"
);

function getBusLagbeNotifications() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "busLagbeNotifications"
            )
        ) || [];
    } catch {
        return [];
    }
}

function saveBusLagbeNotifications(
    notifications
) {
    localStorage.setItem(
        "busLagbeNotifications",
        JSON.stringify(notifications)
    );
}

function getNotificationIcon(type) {
    const icons = {
        ticket: "ticket-check",
        payment: "badge-check",
        user: "user-round-check",
        bus: "bus-front",
        general: "bell"
    };

    return icons[type] || "bell";
}

function formatNotificationTime(value) {
    if (!value) {
        return "Just now";
    }

    const date = new Date(value);

    const difference =
        Date.now() - date.getTime();

    const minutes = Math.floor(
        difference / 60000
    );

    const hours = Math.floor(
        difference / 3600000
    );

    const days = Math.floor(
        difference / 86400000
    );

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return `${days}d ago`;
}

function renderBusLagbeNotifications() {
    if (
        !notificationList ||
        !notificationBadge
    ) {
        return;
    }

    const notifications =
        getBusLagbeNotifications();

    const unreadNotifications =
        notifications.filter(
            notification =>
                !notification.read
        );

    if (unreadNotifications.length) {
        notificationBadge.textContent =
            unreadNotifications.length > 9
                ? "9+"
                : unreadNotifications.length;

        notificationBadge.classList.remove(
            "hidden"
        );
    } else {
        notificationBadge.classList.add(
            "hidden"
        );
    }

    notificationList.innerHTML = "";

    if (!notifications.length) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                No notifications yet.
            </div>
        `;

        return;
    }

    notifications
        .slice()
        .reverse()
        .forEach(notification => {
            const item =
                document.createElement("div");

            item.className =
                `notification-item ${
                    notification.read
                        ? ""
                        : "unread"
                }`;

            item.dataset.notificationId =
                notification.id;

            item.innerHTML = `
                <div class="notification-item-icon">
                    <i data-lucide="${getNotificationIcon(
                        notification.type
                    )}"></i>
                </div>

                <div class="notification-item-content">
                    <strong>
                        ${notification.title}
                    </strong>

                    <p>
                        ${notification.message}
                    </p>

                    <span>
                        ${formatNotificationTime(
                            notification.createdAt
                        )}
                    </span>
                </div>
            `;

            item.addEventListener("click", () => {
                markBusLagbeNotificationRead(
                    notification.id
                );

                if (notification.link) {
                    window.location.href =
                        notification.link;
                }
            });

            notificationList.appendChild(item);
        });

    lucide.createIcons();
}

function addBusLagbeNotification(
    title,
    message,
    type = "general",
    link = null
) {
    const notifications =
        getBusLagbeNotifications();

    const notification = {
        id:
            "NOTIF-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7)
                .toUpperCase(),
        title,
        message,
        type,
        link,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.push(notification);

    saveBusLagbeNotifications(notifications);

    renderBusLagbeNotifications();

    return notification;
}

function markBusLagbeNotificationRead(id) {
    const notifications =
        getBusLagbeNotifications().map(
            notification => {
                if (notification.id === id) {
                    return {
                        ...notification,
                        read: true
                    };
                }

                return notification;
            }
        );

    saveBusLagbeNotifications(notifications);

    renderBusLagbeNotifications();
}

function markAllBusLagbeNotificationsRead() {
    const notifications =
        getBusLagbeNotifications().map(
            notification => ({
                ...notification,
                read: true
            })
        );

    saveBusLagbeNotifications(notifications);

    renderBusLagbeNotifications();
}

if (
    notificationButton &&
    notificationPanel
) {
    notificationButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            notificationPanel.classList.toggle(
                "show"
            );
        }
    );

    notificationPanel.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );

    document.addEventListener("click", () => {
        notificationPanel.classList.remove(
            "show"
        );
    });
}

if (markAllReadButton) {
    markAllReadButton.addEventListener(
        "click",
        markAllBusLagbeNotificationsRead
    );
}

window.addBusLagbeNotification =
    addBusLagbeNotification;

window.renderBusLagbeNotifications =
    renderBusLagbeNotifications;

window.addEventListener(
    "DOMContentLoaded",
    () => {
        renderBusLagbeNotifications();

        lucide.createIcons();
    }
);
