"use client";
import { FunctionComponent, ReactElement, useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { Button } from "@nextui-org/button";

const MyAccountTab: FunctionComponent = (): ReactElement => {
    const [isLogin, setLogin] = useState(true);

    return (
        <div className="auth-form-wrapper">
                    <div className="auth-button-wrapper">
                        <Button
                            size="lg"
                            radius="sm"
                            color="primary"
                            className={`btn text-title-2 md:text-22 max-md:h-10 ${isLogin ? "primary-btn shadow-input": "primary-outline-btn"}`}
                            onPress={() => setLogin(true)}
                            
                        >
                            Login
                        </Button>
                        <Button
                            size="lg"
                            radius="sm"
                            color="primary"
                            className={`btn text-title-2 md:text-22 max-md:h-10 ${!isLogin ? "primary-btn shadow-input": "primary-outline-btn"}`}
                            onPress={() => setLogin(false)}
                        >
                            Register
                        </Button>
                    </div>
                    {
                        isLogin ? <Login/>: <Register/>

                    }                  
                    
                </div >
    )
}

export default MyAccountTab;