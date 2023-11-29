import { useEffect, useRef } from "react";
import * as ROSLIB from "roslib";

const RoslibService = () => {
  const rosRef = useRef<any>(null);
  const subsRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const ip = ""; // Replace with the desired IP

  const init = () => {
    rosRef.current = new ROSLIB.Ros({
      url: `ws://${ip}:9090`,
    });

    rosRef.current.on("connection", () => {
      console.log("Connection established");
    });

    rosRef.current.on("close", () => {
      console.log("Connection closed");
      console.log("Robot pose publisher closed");
      // Send command to close robot_pose_publisher
    });

    subsRef.current = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/odom",
      messageType: "nav_msgs/Odometry",
    });

    subsRef.current.subscribe((message: any) => {
      console.log(message.twist.twist.linear.x);
    });
  };

  const pubs = () => {
    const pub = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });
    const mess = new ROSLIB.Message({
      linear: {
        x: 3,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    pub.publish(mess);
  };

  const stop = () => {
    const pub = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });
    const mess = new ROSLIB.Message({
      linear: {
        x: 0,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    pub.publish(mess);
  };

  useEffect(() => {
    init();

    return () => {
      // Cleanup logic or close connections if needed
    };
  }, []);

  return { pubs, stop };
};

export default RoslibService;
