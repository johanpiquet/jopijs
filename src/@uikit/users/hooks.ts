import {_usePage, type UiUserInfos} from "jopijs/ui";
import React from "react";

export function useLogOutUser(): ()=>void {
    const page = _usePage();

    return () => {
        page.logOutUser();
        page.onRequireRefresh();
    }
}

export function useUserStateRefresh() {
    const page = _usePage();

    return () => {
        page.refreshUserInfos();
        page.onRequireRefresh();
    }
}

export function useUserHasRoles(roles: string[]): boolean {
    if (roles.length === 0) return true;

    let userInfos = useUserInfos();
    if (!userInfos) return false;

    let userRoles = userInfos.roles;
    if (!userRoles) return false;

    return !!roles.every(role => userRoles.includes(role));
}

export function useUserInfos(): UiUserInfos|undefined {
    const page = _usePage();
    return page.getUserInfos();
}

export function RequireRoles({roles, children}: {
    roles: string[],
    children: React.ReactNode
}) {
    const hasRoles = useUserHasRoles(roles);

    if (hasRoles) {
        return children;
    }

    return null;
}