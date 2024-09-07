"use client";

import useAuth from "@/context/useAuth";
import React from "react";
import Login from "@/components/Login";


const Home = () => {
const {authStatus} = useAuth();

    return(
        <Login />
    )
}

export default Home;