import Script from "next/script"; // Adjust the path accordingly

interface SlamProps { }
export default function Slam(props: SlamProps): JSX.Element {

    // var ros = new ROSLIB.Ros({
    //     url: 'ws://localhost:9090'
    // });

    return (
        <>
            <h1>tess</h1>
            <Script src="/script/Nav2D.js" strategy="lazyOnload" />
            <Script src="/script/roslib.js" strategy="lazyOnload" />
            <Script src="/script/eventemitter2.min.js" strategy="lazyOnload" />
            <Script src="/script/easeljs.js" strategy="lazyOnload" />
            <Script src="/script/ros2d.js" strategy="lazyOnload" />

        </>

    )
}
