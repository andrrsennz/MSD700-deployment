"use client";

import { useEffect } from "react";
import Script from "next/script";

import createjs from 'createjs-module';
import { ReduxProvider } from "@/app/reduxProvider";

export default function MyApp({ Component, pageProps }: any) {
  return (
    <ReduxProvider>
      <Component {...pageProps} />
    </ReduxProvider>
  );
}
