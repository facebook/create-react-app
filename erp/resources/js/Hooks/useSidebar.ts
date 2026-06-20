import { useState, useCallback } from 'react';

const STORAGE_KEY = 'erp_sidebar_collapsed';

function readStorage(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

interface SidebarState {
    collapsed: boolean;
    toggle: () => void;
    setCollapsed: (value: boolean) => void;
}

export function useSidebar(): SidebarState {
    const [collapsed, setCollapsedState] = useState<boolean>(readStorage);

    const setCollapsed = useCallback((value: boolean) => {
        setCollapsedState(value);
        try {
            localStorage.setItem(STORAGE_KEY, String(value));
        } catch {
            // storage not available
        }
    }, []);

    const toggle = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    return { collapsed, toggle, setCollapsed };
}
