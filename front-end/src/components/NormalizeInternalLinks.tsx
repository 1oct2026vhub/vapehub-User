"use client";

import { useEffect } from 'react';
import { isInternalHref } from '@/lib/utils/links';

const NormalizeInternalLinks = () => {
    useEffect(() => {
        const normalizeLinks = (root: ParentNode = document) => {
            const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href]');

            anchors.forEach((anchor) => {
                if (isInternalHref(anchor.getAttribute('href'), window.location.origin)) {
                    anchor.removeAttribute('target');
                    anchor.removeAttribute('rel');
                }
            });
        };

        normalizeLinks();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) {
                        return;
                    }

                    if (node.matches('a[href]')) {
                        normalizeLinks(node.parentElement ?? document);
                        return;
                    }

                    normalizeLinks(node);
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    return null;
};

export default NormalizeInternalLinks;
