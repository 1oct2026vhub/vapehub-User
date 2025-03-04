"use client";
import { FunctionComponent, ReactElement, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { Button } from "@nextui-org/button";
import { signOut, useSession } from "next-auth/react";

const MyAccountTab: FunctionComponent = (): ReactElement => {
    const [isLogin, setLogin] = useState(true);
    const { data: sessionData, status } = useSession();

    if (status == 'loading') return (
        <div className="auth-form-wrapper">
            <p>Loading...</p>
        </div>
    );
     
    if (status == 'authenticated') return (
        <div className="auth-form-wrapper">
            <p>MY Account: {sessionData?.user?.email}</p>
            <div className="auth-button-wrapper">
                <Button
                    size="md"
                    radius="sm"
                    color="primary"
                    className={`btn text-title-2 md:text-12 max-md:h-10 ${isLogin ? "primary-btn shadow-input" : "primary-outline-btn"}`}
                    onPress={() => signOut()}

                >
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="auth-form-wrapper">
            <div className="auth-button-wrapper">
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    className={`btn text-title-2 md:text-22 max-md:h-10 ${isLogin ? "primary-btn shadow-input" : "primary-outline-btn"}`}
                    onPress={() => setLogin(true)}

                >
                    Login
                </Button>
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    className={`btn text-title-2 md:text-22 max-md:h-10 ${!isLogin ? "primary-btn shadow-input" : "primary-outline-btn"}`}
                    onPress={() => setLogin(false)}
                >
                    Register
                </Button>
            </div>
            {
                isLogin ? <Login /> : <Register />

            }

        </div >
    )
}

export default MyAccountTab;