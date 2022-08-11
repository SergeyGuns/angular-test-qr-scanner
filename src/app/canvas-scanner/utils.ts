
export enum FACING_MODE {
  FRONT = "user",
  BACK = "environment",
}

export function getConstraints(facingMode: FACING_MODE):MediaStreamConstraints {
  const supports = navigator.mediaDevices.getSupportedConstraints();
  let constraints:any = {
    audio: false,
    video: true
  };
  if (
    !supports["width"] ||
    !supports["height"] ||
    !supports["frameRate"] ||
    !supports["facingMode"] ||
    !supports["aspectRatio"]
  ) {
  } else {
    const UNIT = 640 * (window.devicePixelRatio || 1) ;
    constraints = {
      ...constraints,
      video: {
        width: UNIT,
        frameRate: { max: 15 },
        aspectRatio: 1,
        facingMode,
      },
    };
  }
  return constraints
}
