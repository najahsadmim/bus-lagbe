lucide.createIcons();

const languageButton = document.getElementById("languageButton");
const languageMenu = document.getElementById("languageMenu");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");

const routePath = document.getElementById("routePath");
const movingBus = document.getElementById("movingBus");
const mapPlane = document.getElementById("mapPlane");
const phoneFrame = document.getElementById("phoneFrame");
const routeResultCard = document.getElementById("routeResultCard");

const headerBookButton = document.getElementById("headerBookButton");
const heroBookButton = document.getElementById("heroBookButton");
const ctaBookButton = document.getElementById("ctaBookButton");
const findBusButton = document.getElementById("findBusButton");
const logoutButton = document.getElementById("logoutButton");

const animationTimers = [];

let routeAnimationFrame = null;
let routeAnimationRunning = false;

function toggleDropdown(menuToOpen, menuToClose) {
    menuToClose.classList.remove("show");
    menuToOpen.classList.toggle("show");
}

languageButton.addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown(languageMenu, profileMenu);
});

profileButton.addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown(profileMenu, languageMenu);
});

languageMenu.addEventListener("click", event => {
    event.stopPropagation();
});

profileMenu.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    languageMenu.classList.remove("show");
    profileMenu.classList.remove("show");
});

document.querySelectorAll(".dropdown-option").forEach(option => {
    option.addEventListener("click", () => {
        document
            .querySelectorAll(".dropdown-option")
            .forEach(item => item.classList.remove("active-language"));

        option.classList.add("active-language");
        languageMenu.classList.remove("show");

        const selectedLanguage = option.dataset.language;

        if (selectedLanguage === "bn") {
            document.documentElement.lang = "bn";
        } else {
            document.documentElement.lang = "en";
        }
    });
});

function scheduleAnimation(callback, delay) {
    const timer = setTimeout(callback, delay);
    animationTimers.push(timer);
}

function clearAnimationTimers() {
    animationTimers.forEach(timer => clearTimeout(timer));
    animationTimers.length = 0;
}

function resetRouteAnimation() {
    clearAnimationTimers();

    if (routeAnimationFrame) {
        cancelAnimationFrame(routeAnimationFrame);
        routeAnimationFrame = null;
    }

    routeAnimationRunning = false;

    routePath.classList.remove("route-drawing");
    movingBus.classList.remove("bus-visible");
    mapPlane.classList.remove("map-flat");
    phoneFrame.classList.remove("phone-visible");
    routeResultCard.classList.remove("card-visible");

    movingBus.style.left = "440px";
    movingBus.style.top = "105px";
    movingBus.style.transform = "translate(-50%, -50%) rotate(0deg)";

    void routePath.getBoundingClientRect();
}

function moveBusAlongRoute(duration = 3600) {
    const pathLength = routePath.getTotalLength();
    const mapWidth = mapPlane.clientWidth;
    const mapHeight = mapPlane.clientHeight;

    const viewBoxWidth = 600;
    const viewBoxHeight = 600;

    const scaleX = mapWidth / viewBoxWidth;
    const scaleY = mapHeight / viewBoxHeight;

    const startTime = performance.now();

    routeAnimationRunning = true;
    movingBus.classList.add("bus-visible");

    function animateBus(currentTime) {
        if (!routeAnimationRunning) {
            return;
        }

        const elapsed = currentTime - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);

        const progress =
            rawProgress < 0.5
                ? 2 * rawProgress * rawProgress
                : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

        const point = routePath.getPointAtLength(pathLength * progress);

        const nextProgress = Math.min(progress + 0.01, 1);
        const nextPoint = routePath.getPointAtLength(
            pathLength * nextProgress
        );

        const angle =
            Math.atan2(
                nextPoint.y - point.y,
                nextPoint.x - point.x
            ) *
            (180 / Math.PI);

        movingBus.style.left = `${point.x * scaleX}px`;
        movingBus.style.top = `${point.y * scaleY}px`;

        movingBus.style.transform =
            `translate(-50%, -50%) rotate(${angle + 90}deg)`;

        if (rawProgress < 1) {
            routeAnimationFrame = requestAnimationFrame(animateBus);
        } else {
            routeAnimationRunning = false;
            routeAnimationFrame = null;
        }
    }

    routeAnimationFrame = requestAnimationFrame(animateBus);
}

function startRouteAnimation() {
    resetRouteAnimation();

    scheduleAnimation(() => {
        routePath.classList.add("route-drawing");
        moveBusAlongRoute(3600);
    }, 900);

    scheduleAnimation(() => {
        movingBus.classList.remove("bus-visible");
    }, 4700);

    scheduleAnimation(() => {
        mapPlane.classList.add("map-flat");
    }, 5100);

    scheduleAnimation(() => {
        phoneFrame.classList.add("phone-visible");
    }, 6100);

    scheduleAnimation(() => {
        routeResultCard.classList.add("card-visible");
    }, 6900);

    scheduleAnimation(() => {
        routeResultCard.classList.remove("card-visible");
    }, 10300);

    scheduleAnimation(() => {
        phoneFrame.classList.remove("phone-visible");
    }, 10800);

    scheduleAnimation(() => {
        mapPlane.classList.remove("map-flat");
    }, 11200);

    scheduleAnimation(() => {
        startRouteAnimation();
    }, 12700);
}

function goToBooking() {
    window.location.href = "booking.html";
}

[
    headerBookButton,
    heroBookButton,
    ctaBookButton,
    findBusButton
].forEach(button => {
    if (button) {
        button.addEventListener("click", goToBooking);
    }
});

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

const revealElements = document.querySelectorAll(
    ".problem-card, .step-card, .operator-pill, .home-feature-card"
);

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach((element, index) => {
    element.classList.add("reveal-element");
    element.style.transitionDelay = `${(index % 4) * 80}ms`;
    revealObserver.observe(element);
});

window.addEventListener("load", () => {
    startRouteAnimation();
});

window.addEventListener("beforeunload", () => {
    clearAnimationTimers();

    if (routeAnimationFrame) {
        cancelAnimationFrame(routeAnimationFrame);
    }
});

const homeProfileButton = document.getElementById(
    "profileButton"
);

const homeProfileMenu = document.getElementById(
    "profileMenu"
);

if (homeProfileButton && homeProfileMenu) {
    homeProfileButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            homeProfileMenu.classList.toggle(
                "show"
            );
        }
    );

    homeProfileMenu.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );

    document.addEventListener(
        "click",
        () => {
            homeProfileMenu.classList.remove(
                "show"
            );
        }
    );
}

const homeProfileButton = document.getElementById(
    "profileButton"
);

const homeProfileMenu = document.getElementById(
    "profileMenu"
);

const homeLogoutButton = document.getElementById(
    "logoutButton"
);

if (homeProfileButton && homeProfileMenu) {
    homeProfileButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            homeProfileMenu.classList.toggle(
                "show"
            );
        }
    );

    homeProfileMenu.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );

    document.addEventListener(
        "click",
        () => {
            homeProfileMenu.classList.remove(
                "show"
            );
        }
    );
}

if (homeLogoutButton) {
    homeLogoutButton.addEventListener(
        "click",
        () => {
            localStorage.removeItem(
                "busLagbeCurrentUser"
            );

            window.location.href = "index.html";
        }
    );
}
