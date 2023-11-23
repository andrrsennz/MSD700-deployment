"use client";

import Providers from "@/redux/provider";
import { useEffect } from "react";
import Script from "next/script";

export default function MyApp({ Component, pageProps }) {
  return (
    <Providers>
      <Component {...pageProps} />
      <Script src="/script/roslib.js" />
      <Script src="/script/easeljs.js" />
      <Script src="/script/eventemitter2.min.js" />
      <Script src="/script/ros2d.js" />
      <Script src="/script/Nav2D.js" />
      <Script src="/script/navigator/OccupancyGridClientNav.js" />
      <Script src="/script/navigator/Navigator.js" />
      <Script src="/script/navigator/ImageMapClientNav.js" />
    </Providers>
  );
}
