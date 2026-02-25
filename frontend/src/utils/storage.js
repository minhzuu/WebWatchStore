export const parseStoredUser = () => {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") {
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch (error) {
        console.warn(
            "Invalid user data in localStorage, removing entry.",
            error
        );
        localStorage.removeItem("user");
        return null;
    }
};
