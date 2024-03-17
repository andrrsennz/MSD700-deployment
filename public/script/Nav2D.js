/**
 * @author Russell Toris - rctoris@wpi.edu
 * @author Lars Kunze - l.kunze@cs.bham.ac.uk
 */

var NAV2D = NAV2D || {
  REVISION : '0.5.0-SNAPSHOT'
};

/**
 * USE INTERNALLY. Resize an Image map when receive new dimension.
 *
 * @param old_state - Previous state
 * @param viewer - Viewer 2D
 * @param currentGrid - Current grid with information about width, height and position
 */
NAV2D.resizeMap = function(old_state, viewer, currentGrid) {
  if(!old_state){
    old_state = {
      width: currentGrid.width,
      height: currentGrid.height,
      x: currentGrid.pose.position.x,
      y: currentGrid.pose.position.y
    };
    viewer.scaleToDimensions(currentGrid.width, currentGrid.height);
    viewer.shift(currentGrid.pose.position.x, currentGrid.pose.position.y);
  }
  if (old_state.width !== currentGrid.width || old_state.height !== currentGrid.height) {
    viewer.scaleToDimensions(currentGrid.width, currentGrid.height);
    old_state.width = currentGrid.width;
    old_state.height = currentGrid.height;
  }
  if (old_state.x !== currentGrid.pose.position.x || old_state.y !== currentGrid.pose.position.y) {
    viewer.shift((currentGrid.pose.position.x - old_state.x)/1, (currentGrid.pose.position.y - old_state.y)/1);
    old_state.x = currentGrid.pose.position.x;
    old_state.y = currentGrid.pose.position.y;
  }
  return old_state;
};

/**
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * A OccupancyGridClientNav uses an OccupancyGridClient to create a map for use with a Navigator.
 *
 * @constructor
 * @param options - object with following keys:
 *   * ros - the ROSLIB.Ros connection handle
 *   * tfClient (optional) - Read information from TF
 *   * topic (optional) - the map meta data topic to listen to
 *   * robot_pose (optional) - the robot topic or TF to listen position
 *   * image_map - the URL of the image to render
 *   * image (optional) - the route of the image if we want to use the NavigationImage instead the NavigationArrow
 *   * serverName (optional) - the action server name to use for navigation, like '/move_base'
 *   * actionName (optional) - the navigation action name, like 'move_base_msgs/MoveBaseAction'
 *   * rootObject (optional) - the root object to add the click listeners to and render robot markers to
 *   * withOrientation (optional) - if the Navigator should consider the robot orientation (default: false)
 *   * viewer - the main viewer to render to
 */
NAV2D.ImageMapClientNav = function(options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var tfClient = options.tfClient || null;
  var topic = options.topic || '/map_metadata';
  var robot_pose = options.robot_pose || '/robot_pose';
  var image_map = options.image_map;
  var image = options.image || false;
  var serverName = options.serverName || '/move_base';
  var actionName = options.actionName || 'move_base_msgs/MoveBaseAction';
  var rootObject = options.rootObject || new createjs.Container();
  var viewer = options.viewer;
  var withOrientation = options.withOrientation || false;
  var old_state = null;

  // setup a client to get the map
  var client = new ROS2D.ImageMapClient({
    ros : ros,
    rootObject : rootObject,
    topic : topic,
    image : image_map
  });

  var navigator = new NAV2D.Navigator({
    ros: ros,
    tfClient: tfClient,
    serverName: serverName,
    actionName: actionName,
    robot_pose : robot_pose,
    rootObject: rootObject,
    withOrientation: withOrientation,
    image: image
  });

  client.on('change', function() {
    // scale the viewer to fit the map
    old_state = NAV2D.resizeMap(old_state, viewer, client.currentGrid);
  });
};

/**
 * @author Russell Toris - rctoris@wpi.edu
 * @author Lars Kunze - l.kunze@cs.bham.ac.uk
 * @author Raffaello Bonghi - raffaello.bonghi@officinerobotiche.it
 */

/**
 * A navigator can be used to add click-to-navigate options to an object. If
 * withOrientation is set to true, the user can also specify the orientation of
 * the robot by clicking at the goal position and pointing into the desired
 * direction (while holding the button pressed).
 *
 * @constructor
 * @param options - object with following keys:
 *   * ros - the ROSLIB.Ros connection handle
 *   * tfClient (optional) - the TF client
 *   * robot_pose (optional) - the robot topic or TF to listen position
 *   * serverName (optional) - the action server name to use for navigation, like '/move_base'
 *   * actionName (optional) - the navigation action name, like 'move_base_msgs/MoveBaseAction'
 *   * rootObject (optional) - the root object to add the click listeners to and render robot markers to
 *   * withOrientation (optional) - if the Navigator should consider the robot orientation (default: false)
 *   * init_pose (optional) - if true then the Navigator will be use to set 2D Pose Estimate (default: false)
 */
NAV2D.Navigator = function (options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var tfClient = options.tfClient || null;
  var robot_pose = options.robot_pose || "/robot_pose";
  var serverName = options.serverName || "/move_base";
  var actionName = options.actionName || "move_base_msgs/MoveBaseAction";
  var withOrientation = options.withOrientation || false;
  var withCommand = options.withCommand || false;
  var use_image = options.image;
  var init_pose = options.init_pose || false;
  var getInput = false;
  var singlePoint = false;
  var multiPoint = false;
  var navigationStart = false;
  var setHomeBase = false;
  this.rootObject = options.rootObject || new createjs.Container();

  this.goalMarker = null;

  var currentGoal;
  var forward = true;
  var seq = 0;
  var pause = false;
  var rtrnHome = false;
  var touchCount = 0;
  var focusView = false;
  var inputMode = false;
  var mapRotated = false;
  var degreeRot = 0;

  this.multigoalMark = [];
  this.multiPose = [];
  this.singlePose = null;
  this.poseList = [];
  this.homeBasePoint = null;
  this.overlayMarker = null;
  this.overlayPoint = null;

  var focusV = new ROS2D.FocusView({
    rootObject: that.rootObject
  })

  // setup the actionlib client
  var actionClient = new ROSLIB.ActionClient({
    ros: ros,
    actionName: actionName,
    serverName: serverName,
  });
  
  createjs.Touch.enable(that.rootObject);
  /**
   * Send a goal to the navigation stack with the given pose.
   *
   * @param pose - the goal pose
   */
  function sendGoal(pose) {

    that.singlePose = pose;
    

    // create a marker for the goal
    if (that.goalMarker === null) {
      that.goalMarker = new ROS2D.NavigationImage({
        size: 25,
        strokeSize: 1,
        fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
        pulse: false,
        imageUrl: "/icons/pin-point.png",
      });

      that.rootObject.addChildAt(that.goalMarker,1);

      var altgoalmark = that.goalMarker;
      that.goalMarker.addEventListener("dblclick", function (event) {
        if (singlePoint == true && navigationStart == false) {
          var markCont = altgoalmark;
          that.rootObject.removeChild(markCont);
          console.log("child removed");
          that.singlePose = null;
          that.goalMarker = null;
        }
      });

    // createjs.Touch.enable(that.goalMarker);
    that.goalMarker.addEventListener("mousedown", function (event) {
      if (singlePoint == true && navigationStart == false) {
        touchCount++;
        console.log("touch count: ",touchCount);
        if (touchCount === 2) {
          var markCont = altgoalmark;
          that.rootObject.removeChild(markCont);
          console.log("child removed");
          that.singlePose = null;
          that.goalMarker = null;
          touchCount = 0;
        }
        else {
          setTimeout(() => {
            touchCount = 0;
          },1000)
        }

      }
    });
    }


    that.goalMarker.x = pose.position.x;
    that.goalMarker.y = -pose.position.y;
    that.goalMarker.rotation = stage.rosQuaternionToGlobalTheta(
      pose.orientation
    );
    that.goalMarker.scaleX = 1.0 / stage.scaleX;
    that.goalMarker.scaleY = 1.0 / stage.scaleY;

    // goal.on("result", function () {
    //   that.rootObject.removeChild(that.goalMarker);
    //   that.goalMarker = null;
    // });
  }

  function removePinPoint(event){
    var index = that.rootObject.getChildIndex(event.target);
    // that.rootObject.removeChild(event.target);
    that.multigoalMark.splice(index-1,1);
    that.multiPose.splice(index-1,1);
  }

    /**
   * Send a goal to the navigation stack with the given pose.
   *
   * @param pose - the goal pose
   */
    function multiGoal(pose) {

      var length = that.multigoalMark.length;
      var x;

      if (length < 1) {
        x = 0;
      }
      else {
        x = length;
      }

      that.multiPose[x] = pose;
      // that.poseList[x] = {id: x, px: pose.position.x, py: pose.position.y, pw: stage.rosQuaternionToGlobalTheta(pose.orientation)}
      var markerCont = new createjs.Container();

      var imageMarker = new ROS2D.NavigationImage({
        size: 25,
        strokeSize: 1,
        fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
        pulse: false,
        imageUrl: "/icons/pin-point.png",
      });
      markerCont.addChildAt(imageMarker,0);

      var textMarker = new createjs.Text(x+1,"15px Arial","#000");
      textMarker.textBaseline = "middle";
      textMarker.textAlign = "center";
      textMarker.rotation = 90;
      // textMarker.x = imageMarker.image.width/2;
      // textMarker.y = imageMarker.image.height/2;
      markerCont.addChildAt(textMarker,1);

      that.multigoalMark[x] = markerCont;

      that.rootObject.addChildAt(that.multigoalMark[x],x+1);


      markerCont.addEventListener("dblclick", function (event) {
        if (multiPoint == true && navigationStart == false) {
          var markCont = markerCont;
          index = that.rootObject.getChildIndex(markCont);
          console.log(index);
          console.log(event.target);
          that.rootObject.removeChildAt(index);
          console.log("child removed");
          var arrin = index-1;
          that.multigoalMark.splice(arrin,1);
          that.multiPose.splice(arrin,1);
          var lengtharr = that.multigoalMark.length;
          console.log("new arr length: "+lengtharr);
          console.log(that.multigoalMark);
          for(var i = arrin; i<lengtharr; i++) {
            var text = that.multigoalMark[i].getChildAt(1);
            text.text = i+1;
          }
          console.log("number of seq: "+seq);
        }
      });
      // createjs.Touch.enable(markerCont);
      markerCont.addEventListener("mousedown", function (event) {
        if (multiPoint == true && navigationStart == false) {
          touchCount++;
          if (touchCount === 2) {
            var markCont = markerCont;
            index = that.rootObject.getChildIndex(markCont);
            console.log(index);
            console.log(event.target);
            that.rootObject.removeChildAt(index);
            console.log("child removed");
            var arrin = index-1;
            that.multigoalMark.splice(arrin,1);
            that.multiPose.splice(arrin,1);
            var lengtharr = that.multigoalMark.length;
            console.log("new arr length: "+lengtharr);
            console.log(that.multigoalMark);
            for(var i = arrin; i<lengtharr; i++) {
              var text = that.multigoalMark[i].getChildAt(1);
              text.text = i+1;
            }
            console.log("number of seq: "+seq);
            touchCount = 0;
          }
          else {
            setTimeout(() => {
              touchCount = 0;
            },1000)
          }

        }
      });


      that.multigoalMark[x].x = pose.position.x;
      that.multigoalMark[x].y = -pose.position.y;
      that.multigoalMark[x].rotation = stage.rosQuaternionToGlobalTheta(
        pose.orientation
      );
      that.multigoalMark[x].scaleX = 1.0 / stage.scaleX;
      that.multigoalMark[x].scaleY = 1.0 / stage.scaleY;
  
    }

    function overlayPose(pose) {

      that.overlayPoint = pose;

      that.overlayMarker = new ROS2D.NavigationImage({
        size: 25,
        strokeSize: 1,
        fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
        pulse: false,
        imageUrl: "/icons/pin-point.png",
      });
      that.rootObject.addChild(that.overlayMarker);
  

      that.overlayMarker.x = pose.position.x;
      that.overlayMarker.y = -pose.position.y;
      that.overlayMarker.rotation = stage.rosQuaternionToGlobalTheta(
        pose.orientation
      );
      that.overlayMarker.scaleX = 1.0 / stage.scaleX;
      that.overlayMarker.scaleY = 1.0 / stage.scaleY;
  
    }

      /**
   * Send a goal to the navigation stack with the given pose.
   *
   * @param pose - the goal pose
   */
    function asyncFunc(ind){
        return new Promise((resolve)=>{
          var curpose = that.multiPose[ind];
          var goal = new ROSLIB.Goal({
            actionClient: actionClient,
            goalMessage: {
              target_pose: {
                header: {
                  frame_id: "map",
                },
                pose: curpose,
              },
            },
          });
          goal.send();
          that.currentGoal = goal;
          updateOverlayPosition(curpose.position,curpose.orientation);
          // that.multigoalMark[ind].setPulse(true);

          goal.on("result", function () {
            // that.rootObject.removeChild(that.multigoalMark[i]);
            // that.multigoalMark[ind].setPulse(false);
            resolve()
          });
  
        })
      }

        /**
   * Send a goal to the navigation stack with the given pose.
   *
   * @param pose - the goal pose
   */
  async function startNav(){
        // create a goal
        var length = that.multiPose.length;
        navigationStart = true;
        for(var i=0;i<length;i++){
          await asyncFunc(i);
          that.rootObject.removeChild(that.multigoalMark[i]);

        }
        that.multigoalMark = [];
        that.multiPose = [];
        that.poseList = [];
        navigationStart = false;
        withCommand = true;

  }

  function startSingleNav(){
    navigationStart = true;
    that.overlayMarker.visible = true;
    var goal = new ROSLIB.Goal({
      actionClient: actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: "map",
          },
          pose: that.singlePose,
        },
      },
    });
    goal.send();
    updateOverlayPosition(that.singlePose.position,that.singlePose.orientation);
    that.currentGoal = goal;

    goal.on("result", function () {
      if (pause == false) {
        that.rootObject.removeChild(that.goalMarker);
        that.goalMarker = null;
      }
      that.overlayMarker.visible = false;
      navigationStart = false;

      // that.rootObject.removeChild(that.multigoalMark[i]);
    });
  }

  function startRtrnHome(hpose){
    navigationStart = true;
    rtrnhomeMarker.visible = true;
    var goal = new ROSLIB.Goal({
      actionClient: actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: "map",
          },
          pose: hpose,
        },
      },
    });
    goal.send();
    that.currentGoal = goal;

    goal.on("result", function () {

      rtrnhomeMarker.visible = false;
      navigationStart = false;

      // that.rootObject.removeChild(that.multigoalMark[i]);
    });
  }

      /**
   * Send a goal to the navigation stack with the given pose.
   *
   * @param pose - the goal pose
   */
      async function startNavLoop(){
        navigationStart = true;
        that.overlayMarker.visible = true;
        console.log("sequence number at start: "+seq);
        contloop: while (true) {
          if (forward == true) {
            var length = that.multiPose.length;
            for(var i=0;seq<length;seq++){
              // that.multigoalMark[seq].setPulse(true);
              await asyncFunc(seq);
              if (pause == true) {
                that.overlayMarker.visible = false;
                break contloop;
              }
              // that.multigoalMark[seq].setPulse(false);
              // that.rootObject.removeChild(that.multigoalMark[i]);
      
            }
            forward = false;
            seq--;
          }
    
          for(var i=0;seq>=0;seq--){
            await asyncFunc(seq);
            if (pause == true) {
              break contloop;
            }
            // that.rootObject.removeChild(that.multigoalMark[i]);
    
          }
          seq++;
          forward = true;

    
        }
    
        navigationStart = false;
        that.overlayMarker.visible = false;
    
      }

      function rotateCoordinates(x, y, angleInDegrees) {
        // Convert angle to radians
        const angleInRadians = (angleInDegrees * Math.PI) / 180;
      
        // Perform rotation
        const rotatedX = Math.cos(angleInRadians) * x - Math.sin(angleInRadians) * y;
        const rotatedY = Math.sin(angleInRadians) * x + Math.cos(angleInRadians) * y;
      
        // Round the results to avoid floating-point precision issues
        const roundedX = Math.round(rotatedX * 100) / 100;
        const roundedY = Math.round(rotatedY * 100) / 100;
      
        return { x: roundedX, y: roundedY };
      }



  /**
   * Cancel the currently active goal.
   */
  this.cancelGoal = function () {
    console.log("Cancel Goals");
    if (typeof that.currentGoal !== "undefined") {
      console.log(that.currentGoal);
      that.currentGoal.cancel();
    }
    else {
      console.log("undefined");
    }
  };

  // get a handle to the stage
  var stage;
  if (that.rootObject instanceof createjs.Stage) {
    stage = that.rootObject;
  } else {
    stage = that.rootObject.getStage();
  }

  // marker for the robot
  var robotMarker = null;

  robotMarker = new ROS2D.NavigationImage({
    size: 35,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/tank-navy-100.png",
  });

  that.overlayMarker = new ROS2D.NavigationImage({
    size: 25,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/cur-pin-point.png",
  });
  that.overlayMarker.visible = false;

  var homeBaseMarker = new ROS2D.NavigationImage({
    size: 30,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/Home.png",
  });

  var rtrnhomeMarker = new ROS2D.NavigationImage({
    size: 30,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/Rtrn-Home.png",
  });
  rtrnhomeMarker.visible = false;

  // console.log(homeBaseMarker);
  homeBaseMarker.visible = false;
  this.rootObject.addChild(homeBaseMarker);
  this.rootObject.addChild(rtrnhomeMarker);
  this.rootObject.addChild(that.overlayMarker);

  // wait for a pose to come in first
  robotMarker.visible = false;
  this.rootObject.addChild(robotMarker);
  var initScaleSet = false;

  homeBaseMarker.x = 0;
  homeBaseMarker.y = 0;

  var updateRobotPosition = function (pose, orientation) {
    // update the robots position on the map
    robotMarker.x = pose.x;
    robotMarker.y = -pose.y;
    if (focusView) {
      console.log("x coordinate: ",pose.x);
      console.log("y coordinate: ",-pose.y);
      focusV.updateStagePos(pose.x,-pose.y);
    }
    // console.log(initScaleSet);
    if (!initScaleSet) {
      robotMarker.scaleX = 1.0 / stage.scaleX;
      robotMarker.scaleY = 1.0 / stage.scaleY;
      homeBaseMarker.scaleX = 1.0 / stage.scaleX;
      homeBaseMarker.scaleY = 1.0 / stage.scaleY;
      that.overlayMarker.scaleX = 1.0 / stage.scaleX;
      that.overlayMarker.scaleY = 1.0 / stage.scaleY;
      rtrnhomeMarker.scaleX = 1.0 / stage.scaleX;
      rtrnhomeMarker.scaleY = 1.0 / stage.scaleY;
      initScaleSet = true;
    }
    // change the angle
    robotMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);
    // Set visible
    robotMarker.visible = true;
  };

  var updateHomeBasePosition = function (pose, orientation) {
    // update the robots position on the map
    homeBaseMarker.x = pose.x;
    homeBaseMarker.y = -pose.y;
    rtrnhomeMarker.x = pose.x;
    rtrnhomeMarker.y = -pose.y;
    console.log(initScaleSet);
    if (!initScaleSet) {
      robotMarker.scaleX = 1.0 / stage.scaleX;
      robotMarker.scaleY = 1.0 / stage.scaleY;
      homeBaseMarker.scaleX = 1.0 / stage.scaleX;
      homeBaseMarker.scaleY = 1.0 / stage.scaleY;
      rtrnhomeMarker.scaleX = 1.0 / stage.scaleX;
      rtrnhomeMarker.scaleY = 1.0 / stage.scaleY;
      // homeBaseMarker.visible = true;
      initScaleSet = true;
    }
    // change the angle
    homeBaseMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);
    rtrnhomeMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);
    // Set visible
    homeBaseMarker.visible = true;
  };


  var updateOverlayPosition = function (pose, orientation) {
    // update the robots position on the map
    that.overlayMarker.x = pose.x;
    that.overlayMarker.y = -pose.y;
    console.log(initScaleSet);
    if (!initScaleSet) {
      that.overlayMarker.scaleX = 1.0 / stage.scaleX;
      that.overlayMarker.scaleY = 1.0 / stage.scaleY;
      // homeBaseMarker.visible = true;
      initScaleSet = true;
    }
    // change the angle
    that.overlayMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);

  };

  if (tfClient !== null) {
    tfClient.subscribe(robot_pose, function (tf) {
      updateRobotPosition(tf.translation, tf.rotation);
    });
  } else {
    // setup a listener for the robot pose
    var poseListener = new ROSLIB.Topic({
      ros: ros,
      name: robot_pose,
      messageType: "geometry_msgs/Pose",
      throttle_rate: 100,
    });
    poseListener.subscribe(function (pose) {

      updateRobotPosition(pose.position, pose.orientation);
      if (that.homeBasePoint == null && withCommand == false) {
        that.homeBasePoint = pose;
      }
    });
  }


  if (withOrientation === false) {
    // setup a double click listener (no orientation)
    this.rootObject.addEventListener("dblclick", function (event) {
      // convert to ROS coordinates
      var coords = stage.globalToRos(event.stageX, event.stageY);
      var pose = new ROSLIB.Pose({
        position: new ROSLIB.Vector3(coords),
      });
      // send the goal
      sendGoal(pose);
    });
  } else {
    // withOrientation === true
    // setup a click-and-point listener (with orientation)
    var position = null;
    var positionVec3 = null;
    var thetaRadians = 0;
    var thetaDegrees = 0;
    var orientationMarker = null;
    var mouseDown = false;
    var mouseMove = false;
    var xDelta = 0;
    var yDelta = 0;
    var touchStartPos;

    var mouseEventHandler = function (event, mouseState) {
      if (withCommand === true && navigationStart === false && getInput === true) {
      if (event.nativeEvent.button === 0 || (event.nativeEvent.touches && event.nativeEvent.touches.length <= 1)) {
      if (mouseState === "down") {
        // get position when mouse button is pressed down
        // rotPos = stage.globalToRos(event.stageX, event.stageY);
        // var shape = new createjs.Shape();
        // shape.graphics.beginFill("red").drawCircle(0, 0, 20);
        // shape.x = rotPos.x;
        // shape.y = rotPos.y;
        // shape.scaleX = 1/stage.scaleX;
        // shape.scaleY = 1/stage.scaleY;
        // that.rootObject.addChild(shape);
        touchStartPos = { x: event.stageX, y: event.stageY };
        position = stage.globalToRos(event.stageX, event.stageY);
        positionVec3 = new ROSLIB.Vector3(position);
        if (mapRotated) {
          var posroted = rotateCoordinates(positionVec3.x,positionVec3.y,degreeRot);
          positionVec3.x = posroted.x;
          positionVec3.y = posroted.y;
        }
        mouseDown = true;
        console.log("mouse down");
        console.log(event);
        document.body.onmousedown = (e) => { 
          e.preventDefault();
        };
      } 
      
      else if (mouseState === "move") {
        // remove obsolete orientation marker
        that.rootObject.removeChild(orientationMarker);

        if (mouseDown === true) {
          // if mouse button is held down:
          // - get current mouse position
          // - calculate direction between stored <position> and current position
          // - place orientation marker
          var currentPos = stage.globalToRos(event.stageX, event.stageY);
          var currentPosVec3 = new ROSLIB.Vector3(currentPos);
          if (mapRotated) {
            var posroted = rotateCoordinates(currentPosVec3.x,currentPosVec3.y,degreeRot);
            currentPosVec3.x = posroted.x;
            currentPosVec3.y = posroted.y;
          }

          var touchCurrentPos = { x: event.stageX, y: event.stageY };
          var dx = touchCurrentPos.x - touchStartPos.x;
          var dy = touchCurrentPos.y - touchStartPos.y;
          var distanceSquared = dx * dx + dy * dy;
          if (distanceSquared > 100) { // Adjust this threshold as needed
              mouseMove = true;
              if (that.goalMarker != null) {
                that.rootObject.removeChild(that.goalMarker);
                that.goalMarker = null;
                that.singlePose = null;
              }    
              console.log("mouse down and move");
              orientationMarker = new ROS2D.NavigationImage({
                size: 28,
                strokeSize: 1,
                fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
                pulse: false,
                imageUrl: "/icons/pin-point.png",
              });
    
    
              xDelta = currentPosVec3.x - positionVec3.x;
              yDelta = currentPosVec3.y - positionVec3.y;
    
              thetaRadians = Math.atan2(xDelta, yDelta);
    
              thetaDegrees = thetaRadians * (180.0 / Math.PI);
    
              if (thetaDegrees >= 0 && thetaDegrees <= 180) {
                thetaDegrees += 270;
              } else {
                thetaDegrees -= 90;
              }
    
              orientationMarker.x = positionVec3.x;
              orientationMarker.y = -positionVec3.y;
              orientationMarker.rotation = thetaDegrees;
              orientationMarker.scaleX = 1.0 / stage.scaleX;
              orientationMarker.scaleY = 1.0 / stage.scaleY;
              // stage.addChild(orientationMarker);
              that.rootObject.addChild(orientationMarker);
          }

        }
      } else if (mouseState === 'up') {
        // mouseState === 'up'
        // if mouse button is released
        // - get current mouse position (goalPos)
        // - calculate direction between stored <position> and goal position
        // - set pose with orientation
        // - send goal
        if (mouseDown == true && mouseMove == true) {
        mouseDown = false;
        mouseMove = false;
        console.log("mouse up after down and move")

        var goalPos = stage.globalToRos(event.stageX, event.stageY);

        var goalPosVec3 = new ROSLIB.Vector3(goalPos);
        if (mapRotated) {
          var posroted = rotateCoordinates(goalPosVec3.x,goalPosVec3.y,degreeRot);
          goalPosVec3.x = posroted.x;
          goalPosVec3.y = posroted.y;
        }

        xDelta = goalPosVec3.x - positionVec3.x;
        yDelta = goalPosVec3.y - positionVec3.y;

        thetaRadians = Math.atan2(xDelta, yDelta);

        if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
          thetaRadians += (3 * Math.PI) / 2;
        } else {
          thetaRadians -= Math.PI / 2;
        }

        var qz = Math.sin(-thetaRadians / 2.0);
        var qw = Math.cos(-thetaRadians / 2.0);

        var orientation = new ROSLIB.Quaternion({ x: 0, y: 0, z: qz, w: qw });

        var pose = new ROSLIB.Pose({
          position: positionVec3,
          orientation: orientation,
        });

        document.body.onmousedown = null;

        if (init_pose == false && setHomeBase == false) {
        // send the goal
        that.rootObject.removeChild(orientationMarker);
          if (multiPoint == false) {
            sendGoal(pose);
          }
          else {
            multiGoal(pose);
          }
          // document.body.onmousedown = null;
        }
        else if (init_pose == true && setHomeBase == false) {
          var pub = new ROSLIB.Topic({
            ros : ros,
            name : "/initialpose",
            messageType : "geometry_msgs/PoseWithCovarianceStamped"
          })
      
          var currentTime = new Date();
          var secs = Math.floor(currentTime.getTime()/1000);
          var nsecs = Math.round(
            1000000000 * (currentTime.getTime() / 1000 - secs)
          );
          var msg = new ROSLIB.Message({
            header : {
              stamp : {
                secs: secs,
                nsecs : nsecs
              },
              frame_id : "map"
            },
            pose : {pose}
            
          });
  
          pub.publish(msg);
          that.rootObject.removeChild(orientationMarker);
          console.log("initial pose published");
          // document.body.onmousedown = null;
        }
        else if (init_pose == false && setHomeBase == true) {
          updateHomeBasePosition(pose.position,pose.orientation);
          that.homeBasePoint = pose;
          that.rootObject.removeChild(orientationMarker);
          console.log("home base position updated");
        }
      }
      else {
        mouseDown = false;
        position = null;
        positionVec3 = null;
        console.log("mouse up after down and no move")
        document.body.onmousedown = null;
      }
        
      } 
      else if (mouseState === 'dblclick'){
       if (multiPoint == false) {
        that.cancelGoal();
        mouseDown = false;
        position = null;
        positionVec3 = null;
        console.log("mouse double clicked")
       }

      }

    }

  }
    
    };

    this.rootObject.addEventListener("stagemousedown", function (event) {
      mouseEventHandler(event, "down");
    });

    this.rootObject.addEventListener("stagemousemove", function (event) {
      mouseEventHandler(event, "move");
    });

    this.rootObject.addEventListener("stagemouseup", function (event) {
      mouseEventHandler(event, "up");
    });

    this.rootObject.addEventListener("dblclick", function(event) {
      mouseEventHandler(event,"dblclick");
    });
    
  
}

  NAV2D.Navigator.prototype.testNaav = function() {
    console.log("this is from navigator");
  }

  NAV2D.Navigator.prototype.startNaav = function() {
    if (getInput == false) {
      if (that.multigoalMark.length > 0) {
        pause = false;
        startNavLoop();
      }
      else if (that.singlePose !== null) {
        pause = false;
        startSingleNav();
      }
      console.log("navigation started");
    }

  }

  NAV2D.Navigator.prototype.startNaavLoop = function() {
    console.log("navigation loop started");
    pause = false;
    startNavLoop();
  }

  NAV2D.Navigator.prototype.pauseNav = function() {
    console.log("navigation paused");
    that.cancelGoal();
    pause = true;
    navigationStart = false;
  }

  NAV2D.Navigator.prototype.initPose = function(state) {
    console.log("Initpose");
    init_pose = state;
    getInput = state;
  }

  NAV2D.Navigator.prototype.multiPointMode = function(state) {
    console.log("multipoint mode");
    if (that.singlePose !== null) {
      this.rootObject.removeChild(that.goalMarker);
      that.goalMarker = null;
      that.singlePose = null;
      console.log("all mark removed");
    }
    multiPoint = state;
    getInput = state;
  }

  NAV2D.Navigator.prototype.singlePointMode = function(state) {
    console.log("singlepoint mode");
    if (that.multigoalMark !== null) {
      console.log("all mark removed");
      var length = that.multigoalMark.length;
      for (var i=0; i<length; i++) {
        this.rootObject.removeChild(that.multigoalMark[i]);
      }
      that.multigoalMark = [];
      that.multiPose = [];
      seq = 0;
    }
    singlePoint = state;
    getInput = state;
  }

  NAV2D.Navigator.prototype.pinPointList = function() {
    console.log("pin point list updated");
    return(that.poseList);
  }

  NAV2D.Navigator.prototype.cancelMultiGoal = function() {
    console.log("goal canceled");
    that.cancelGoal();
    var length = that.multigoalMark.length;
    for (var i=0; i<length; i++) {
      this.rootObject.removeChild(that.multigoalMark[i]);
    }
    that.multigoalMark = [];
    that.multiPose = [];
  }

    NAV2D.Navigator.prototype.removeAllMark = function() {
      if (multiPoint == true) {
        console.log("all mark removed");
        var length = that.multigoalMark.length;
        for (var i=0; i<length; i++) {
          this.rootObject.removeChild(that.multigoalMark[i]);
        }
        that.multigoalMark = [];
        that.multiPose = [];
        seq = 0;
      }
      else if (singlePoint == true) {
        this.rootObject.removeChild(that.goalMarker);
        that.goalMarker = null;
        that.singlePose = null;
        console.log("all mark removed");
      }

  }

  NAV2D.Navigator.prototype.getHomeBasePoint = function() {
    console.log("home base point acquired");
    return(that.homeBasePoint);
  }  

  NAV2D.Navigator.prototype.setHomeBasePoint = function(state) {
    console.log("set home base point");
    setHomeBase = state;
    getInput = state;
  } 

  NAV2D.Navigator.prototype.setNavigation = function(state) {
    console.log("navigation state: " + state);
    withCommand = state;
  }  

  NAV2D.Navigator.prototype.updateHome = function(hpose) {
    updateHomeBasePosition(hpose.position,hpose.orientation);
    console.log("home base updated");
    console.log(hpose);

  }  

  NAV2D.Navigator.prototype.updateInitHome = function(hpose) {
    console.log("home base updated");
    updateHomeBasePosition(hpose.position,hpose.orientation);
    //set robot initial pose
    var pose = new ROSLIB.Pose({
      position: hpose.position,
      orientation: hpose.orientation,
    });
    var pub = new ROSLIB.Topic({
      ros : ros,
      name : "/initialpose",
      messageType : "geometry_msgs/PoseWithCovarianceStamped"
    })

    var currentTime = new Date();
    var secs = Math.floor(currentTime.getTime()/1000);
    var nsecs = Math.round(
      1000000000 * (currentTime.getTime() / 1000 - secs)
    );
    var msg = new ROSLIB.Message({
      header : {
        stamp : {
          secs: secs,
          nsecs : nsecs
        },
        frame_id : "map"
      },
      pose : {pose}
      
    });

    pub.publish(msg);
    // that.rootObject.removeChild(orientationMarker);
    console.log("initial pose published")

  }  

  NAV2D.Navigator.prototype.returnToHome = function(hpose) {
    console.log("robot return to home");
    pause = false;
    var pose = new ROSLIB.Pose({
      position: hpose.position,
      orientation: hpose.orientation,
    });
    // rtrnHome = true;
    startRtrnHome(pose);
    
  }  

  NAV2D.Navigator.prototype.setFocusView = function(state) {
    focusView = state;
    console.log("focus view state: ",focusView);
    
  }  

  NAV2D.Navigator.prototype.reScale = function() {
    initScaleSet = false;
    console.log("map rescaled");
    
  }  

  NAV2D.Navigator.prototype.changeRoot = function(rootobj) {
    that.rootObject = rootobj;
    console.log("root object change");
    
  }
  
  NAV2D.Navigator.prototype.rotateMap = function(degree) {
    mapRotated = true;
    degreeRot += degree;

  }

  NAV2D.Navigator.prototype.resetRotateMap = function() {
    mapRotated = false;
    degreeRot = 0;

  }

};

/**
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * A OccupancyGridClientNav uses an OccupancyGridClient to create a map for use with a Navigator.
 *
 * @constructor
 * @param options - object with following keys:
 *   * ros - the ROSLIB.Ros connection handle
 *   * tfClient (optional) - Read information from TF
 *   * topic (optional) - the map topic to listen to
 *   * robot_pose (optional) - the robot topic or TF to listen position
 *   * rootObject (optional) - the root object to add this marker to
 *   * continuous (optional) - if the map should be continuously loaded (e.g., for SLAM)
 *   * serverName (optional) - the action server name to use for navigation, like '/move_base'
 *   * actionName (optional) - the navigation action name, like 'move_base_msgs/MoveBaseAction'
 *   * rootObject (optional) - the root object to add the click listeners to and render robot markers to
 *   * withOrientation (optional) - if the Navigator should consider the robot orientation (default: false)
 *   * image (optional) - the route of the image if we want to use the NavigationImage instead the NavigationArrow
 *   * viewer - the main viewer to render to
 *   * init_pose (optional) - if true then the Navigator will be use to set 2D Pose Estimate (default: false)
 */
NAV2D.OccupancyGridClientNav = function (options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var tfClient = options.tfClient || null;
  var map_topic = options.topic || "/map";
  var robot_pose = options.robot_pose || "/robot_pose";
  var continuous = options.continuous;
  var serverName = options.serverName || "/move_base";
  var actionName = options.actionName || "move_base_msgs/MoveBaseAction";
  var rootObject = options.rootObject || new createjs.Container();
  var viewer = options.viewer;
  var withOrientation = options.withOrientation || false;
  var withCommand = options.withCommand || false;
  var image = options.image || false;
  var init_pose = options.init_pose || false;
  var old_state = null;

  // setup a client to get the map
  var client = new ROS2D.OccupancyGridClient({
    ros: ros,
    rootObject: rootObject,
    continuous: continuous,
    topic: map_topic,
  });

  this.navigator = new NAV2D.Navigator({
    ros: ros,
    tfClient: tfClient,
    serverName: serverName,
    actionName: actionName,
    robot_pose: robot_pose,
    rootObject: rootObject,
    withOrientation: withOrientation,
    withCommand: withCommand,
    image: image,
    init_pose: init_pose
  });


  client.on("change", function () {
    // scale the viewer to fit the map
    console.log("draw map");
    old_state = NAV2D.resizeMap(old_state, viewer, client.currentGrid);
  });
};

/**
 * @author Russell Toris - rctoris@wpi.edu
 * @author Lars Kunze - l.kunze@cs.bham.ac.uk
 * @author Raffaello Bonghi - raffaello.bonghi@officinerobotiche.it
 */

/**
 * A navigator can be used to add click-to-navigate options to an object. If
 * withOrientation is set to true, the user can also specify the orientation of
 * the robot by clicking at the goal position and pointing into the desired
 * direction (while holding the button pressed).
 *
 * @constructor
 * @param options - object with following keys:
 *   * ros - the ROSLIB.Ros connection handle
 *   * tfClient (optional) - the TF client
 *   * robot_pose (optional) - the robot topic or TF to listen position
 *   * serverName (optional) - the action server name to use for navigation, like '/move_base'
 *   * actionName (optional) - the navigation action name, like 'move_base_msgs/MoveBaseAction'
 *   * rootObject (optional) - the root object to add the click listeners to and render robot markers to
 *   * withOrientation (optional) - if the Navigator should consider the robot orientation (default: false)
 *   * init_pose (optional) - if true then the Navigator will be use to set 2D Pose Estimate (default: false)
 */
NAV2D.prevNavigator = function (options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var tfClient = options.tfClient || null;
  var robot_pose = options.robot_pose || "/robot_pose";
  var serverName = options.serverName || "/move_base";
  var actionName = options.actionName || "move_base_msgs/MoveBaseAction";
  var withOrientation = options.withOrientation || false;
  var withCommand = options.withCommand || false;
  var use_image = options.image;
  var init_pose = options.init_pose || false;
  var getInput = false;
  var singlePoint = false;
  var multiPoint = false;
  var navigationStart = false;
  var setHomeBase = false;
  this.rootObject = options.rootObject || new createjs.Container();

  this.goalMarker = null;

  var currentGoal;
  var forward = true;
  var seq = 0;
  var pause = false;
  var rtrnHome = false;
  var touchCount = 0;
  var focusView = false;
  var inputMode = false;

  this.multigoalMark = [];
  this.multiPose = [];
  this.singlePose = null;
  this.poseList = [];
  this.homeBasePoint = null;
  this.overlayMarker = null;
  this.overlayPoint = null;

  var focusV = new ROS2D.FocusView({
    rootObject: that.rootObject
  })

  // setup the actionlib client
  var actionClient = new ROSLIB.ActionClient({
    ros: ros,
    actionName: actionName,
    serverName: serverName,
  });
  
  createjs.Touch.enable(that.rootObject);




  /**
   * Cancel the currently active goal.
   */
  this.cancelGoal = function () {
    console.log("Cancel Goals");
    if (typeof that.currentGoal !== "undefined") {
      console.log(that.currentGoal);
      that.currentGoal.cancel();
    }
    else {
      console.log("undefined");
    }
  };

  // get a handle to the stage
  var stage;
  if (that.rootObject instanceof createjs.Stage) {
    stage = that.rootObject;
  } else {
    stage = that.rootObject.getStage();
  }

  // marker for the robot
  var robotMarker = null;

  robotMarker = new ROS2D.NavigationImage({
    size: 35,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/tank-navy-100.png",
  });

  that.overlayMarker = new ROS2D.NavigationImage({
    size: 25,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/cur-pin-point.png",
  });
  that.overlayMarker.visible = false;

  var homeBaseMarker = new ROS2D.NavigationImage({
    size: 30,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/Home.png",
  });

  var rtrnhomeMarker = new ROS2D.NavigationImage({
    size: 30,
    strokeSize: 1,
    fillColor: createjs.Graphics.getRGB(0, 0, 255, 0.66),
    pulse: false,
    imageUrl: "/icons/Rtrn-Home.png",
  });
  rtrnhomeMarker.visible = false;

  // console.log(homeBaseMarker);
  homeBaseMarker.visible = false;
  this.rootObject.addChild(homeBaseMarker);
  this.rootObject.addChild(rtrnhomeMarker);
  this.rootObject.addChild(that.overlayMarker);

  // wait for a pose to come in first
  robotMarker.visible = false;
  this.rootObject.addChild(robotMarker);
  var initScaleSet = false;

  homeBaseMarker.x = 0;
  homeBaseMarker.y = 0;

  var updateRobotPosition = function (pose, orientation) {
    // update the robots position on the map
    robotMarker.x = pose.x;
    robotMarker.y = -pose.y;
    if (focusView) {
      console.log("x coordinate: ",pose.x);
      console.log("y coordinate: ",-pose.y);
      focusV.updateStagePos(pose.x,-pose.y);
    }
    // console.log(initScaleSet);
    if (!initScaleSet) {
      robotMarker.scaleX = 1.0 / (stage.scaleX*2);
      robotMarker.scaleY = 1.0 / (stage.scaleY*2);
      homeBaseMarker.scaleX = 1.0 / (stage.scaleX*2);
      homeBaseMarker.scaleY = 1.0 / (stage.scaleY*2);
      that.overlayMarker.scaleX = 1.0 / stage.scaleX;
      that.overlayMarker.scaleY = 1.0 / stage.scaleY;
      rtrnhomeMarker.scaleX = 1.0 / stage.scaleX;
      rtrnhomeMarker.scaleY = 1.0 / stage.scaleY;
      initScaleSet = true;
    }
    // change the angle
    robotMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);
    // Set visible
    robotMarker.visible = true;
  };

  var updateHomeBasePosition = function (pose, orientation) {
    // update the robots position on the map
    homeBaseMarker.x = pose.x;
    homeBaseMarker.y = -pose.y;
    rtrnhomeMarker.x = pose.x;
    rtrnhomeMarker.y = -pose.y;
    console.log(initScaleSet);
    if (!initScaleSet) {
      robotMarker.scaleX = 1.0 / stage.scaleX;
      robotMarker.scaleY = 1.0 / stage.scaleY;
      homeBaseMarker.scaleX = 1.0 / stage.scaleX;
      homeBaseMarker.scaleY = 1.0 / stage.scaleY;
      rtrnhomeMarker.scaleX = 1.0 / stage.scaleX;
      rtrnhomeMarker.scaleY = 1.0 / stage.scaleY;
      // homeBaseMarker.visible = true;
      initScaleSet = true;
    }
    // change the angle
    homeBaseMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);
    rtrnhomeMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);
    // Set visible
    homeBaseMarker.visible = true;
  };


  var updateOverlayPosition = function (pose, orientation) {
    // update the robots position on the map
    that.overlayMarker.x = pose.x;
    that.overlayMarker.y = -pose.y;
    console.log(initScaleSet);
    if (!initScaleSet) {
      that.overlayMarker.scaleX = 1.0 / stage.scaleX;
      that.overlayMarker.scaleY = 1.0 / stage.scaleY;
      // homeBaseMarker.visible = true;
      initScaleSet = true;
    }
    // change the angle
    that.overlayMarker.rotation = stage.rosQuaternionToGlobalTheta(orientation);

  };

  if (tfClient !== null) {
    tfClient.subscribe(robot_pose, function (tf) {
      updateRobotPosition(tf.translation, tf.rotation);
    });
  } else {
    // setup a listener for the robot pose
    var poseListener = new ROSLIB.Topic({
      ros: ros,
      name: robot_pose,
      messageType: "geometry_msgs/Pose",
      throttle_rate: 100,
    });
    poseListener.subscribe(function (pose) {
      //console.log(pose.position);
      //console.log(pose.orientation);
      // console.log(that.rootObject);
      // console.log(robotMarker);
      // console.log("add robot marker");
      updateRobotPosition(pose.position, pose.orientation);
      if (that.homeBasePoint == null && withCommand == false) {
        that.homeBasePoint = pose;
      }
    });
  }

  NAV2D.prevNavigator.prototype.updateHome = function(hpose) {
    updateHomeBasePosition(hpose.position,hpose.orientation);
    console.log("home base updated");
    console.log(hpose);

  }  


};

/**
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * A OccupancyGridClientNav uses an OccupancyGridClient to create a map for use with a Navigator.
 *
 * @constructor
 * @param options - object with following keys:
 *   * ros - the ROSLIB.Ros connection handle
 *   * tfClient (optional) - Read information from TF
 *   * topic (optional) - the map topic to listen to
 *   * robot_pose (optional) - the robot topic or TF to listen position
 *   * rootObject (optional) - the root object to add this marker to
 *   * continuous (optional) - if the map should be continuously loaded (e.g., for SLAM)
 *   * serverName (optional) - the action server name to use for navigation, like '/move_base'
 *   * actionName (optional) - the navigation action name, like 'move_base_msgs/MoveBaseAction'
 *   * rootObject (optional) - the root object to add the click listeners to and render robot markers to
 *   * withOrientation (optional) - if the Navigator should consider the robot orientation (default: false)
 *   * image (optional) - the route of the image if we want to use the NavigationImage instead the NavigationArrow
 *   * viewer - the main viewer to render to
 *   * init_pose (optional) - if true then the Navigator will be use to set 2D Pose Estimate (default: false)
 */
NAV2D.PreviewGridClientNav = function (options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var tfClient = options.tfClient || null;
  var map_topic = options.topic || "/map";
  var robot_pose = options.robot_pose || "/robot_pose";
  var continuous = options.continuous;
  var serverName = options.serverName || "/move_base";
  var actionName = options.actionName || "move_base_msgs/MoveBaseAction";
  var rootObject = options.rootObject || new createjs.Container();
  var viewer = options.viewer;
  var withOrientation = options.withOrientation || false;
  var withCommand = options.withCommand || false;
  var image = options.image || false;
  var init_pose = options.init_pose || false;
  var old_state = null;

  // setup a client to get the map
  var prevClient = new ROS2D.OccupancyGridClient({
    ros: ros,
    rootObject: rootObject,
    continuous: continuous,
    topic: map_topic,
  });

  this.prevNavigator = new NAV2D.prevNavigator({
    ros: ros,
    tfClient: tfClient,
    serverName: serverName,
    actionName: actionName,
    robot_pose: robot_pose,
    rootObject: rootObject,
    withOrientation: withOrientation,
    withCommand: withCommand,
    image: image,
    init_pose: init_pose
  });


  prevClient.on("change", function () {
    // scale the viewer to fit the map
    console.log("draw map");
    old_state = NAV2D.resizeMap(old_state, viewer, prevClient.currentGrid);
  });
};



