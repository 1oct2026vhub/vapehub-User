"use client";
import { FunctionComponent, ReactElement, useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import { Button } from "@nextui-org/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const MyAccountTab: FunctionComponent = (): ReactElement => {
    const [isLogin, setLogin] = useState(true);
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push(ROUTES.MY_ACCOUNT_ORDERS);
        }
    }, [status, router]);

    if (status == 'loading') return (
        <div className="auth-form-wrapper">
            <p>Loading...</p>
        </div>
    );
     
    if (status == 'authenticated') {
        return (
            <div className="auth-form-wrapper">
                <p>Redirecting to my account...</p>
            </div>
        );
    }

    return (
        <div className="auth-form-wrapper">
            <div className="auth-button-wrapper">
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    className={`btn text-title-1 md:text-2xl max-md:h-10 ${isLogin ? "primary-btn shadow-input" : "primary-outline-btn"}`}
                    onPress={() => setLogin(true)}

                >
                    Login
                </Button>
                <Button
                    size="lg"
                    radius="sm"
                    color="primary"
                    className={`btn text-title-1 md:text-2xl max-md:h-10 ${!isLogin ? "primary-btn shadow-input" : "primary-outline-btn"}`}
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