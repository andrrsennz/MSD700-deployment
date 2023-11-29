"use client";

import Providers from "@/redux/provider";
import { useEffect } from "react";
import Script from "next/script";

import createjs from 'createjs-module';

export default function MyApp({ Component, pageProps }) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
