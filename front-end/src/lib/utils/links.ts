const INTERNAL_HOSTNAMES = new Set([
    'localhost',
    'www.vapehub.co.uk',
    'vapehub.co.uk',
    'vapehub-staging.devateam.com',
]);

export const isInternalHref = (href?: string | null, origin?: string): boolean => {
    if (!href) {
        return false;
    }

    const trimmedHref = href.trim();

    if (!trimmedHref || trimmedHref.startsWith('#')) {
        return true;
    }

    if (trimmedHref.startsWith('/')) {
        return true;
    }

    if (!origin) {
        return false;
    }

    try {
        const url = new URL(trimmedHref, origin);
        const currentHostname = origin ? new URL(origin).hostname : '';

        return INTERNAL_HOSTNAMES.has(url.hostname) || (!!currentHostname && url.hostname === currentHostname);
    } catch {
        return false;
    }
};
