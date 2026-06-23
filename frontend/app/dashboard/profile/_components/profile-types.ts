export type ProfileUser = {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    phoneNumber?: string | null;
    profilePicture?: string | null;
    role?: string;
    updatedAt?: string;
};

export function resolveProfileImageSrc(profilePicture?: string | null) {
    if (!profilePicture) {
        return null;
    }

    if (profilePicture.startsWith("http") || profilePicture.startsWith("data:")) {
        return profilePicture;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088";
    return `${apiBase}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`;
}

export function formatRelativeDate(value?: string) {
    if (!value) {
        return "Just now";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    const elapsed = Date.now() - date.getTime();
    const minutes = Math.round(elapsed / 60000);

    if (minutes < 60) {
        return `${Math.max(1, minutes)} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
}