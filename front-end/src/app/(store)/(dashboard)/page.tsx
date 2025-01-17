"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { NextPage } from "next";
import { ReactElement } from "react";

const Dashboard: NextPage = (): ReactElement => {
  return (
    <>
      <Header />
      <Footer />
    </>
  );
};

export default Dashboard;
