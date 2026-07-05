'use client';

import { logout } from "@database/user/actions";
import { Button } from "./ui/button";

export default function UserLogout() {
    return (
        <Button variant="outline" className="w-full" onClick={() => logout()}>
            Log out
        </Button>
    );
}
