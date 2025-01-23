"use client"

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { NextPage } from "next";
import { ReactElement } from "react";

const Dashboard: NextPage = (): ReactElement => {
  return (
    <>
      <Header />
      <main className="px-4 md:px-12.5 py-5 md:py-10">

      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
