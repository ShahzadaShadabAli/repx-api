const elbowLever = [
    "Elbow Lever",
    { name: "reverse grip push up", repsReq: 10, type: 0 },
    { name: "reverse grip lean forward", repsReq: 20, type: 1 },
    { name: "reverse grip one leg raises", repsReq: 10, type: 0 },
    "Push",
    ""
  ];
  
  const handstand = [
    "Handstand",
    { name: "pike pushups", repsReq: 12, type: 0 },
    { name: "elevated pike hold", repsReq: 15, type: 1 },
    { name: "wall assisted handstand", repsReq: 12, type: 1 },
    { name: "Wall Leg Switches", repsReq: 12, type: 0 },
    "Push",
    ""
  ];
  
  const planche = [
    "Planche",
    { name: "Decline Push ups", repsReq: 12, type: 0 },
    { name: "Planche Hold", repsReq: 10, type: 1 },
    { name: "Floor Assisted Tuck Planche", repsReq: 12, type: 1 },
    { name: "Pseudo Push Ups", repsReq: 6, type: 0 },
    { name: "Tuck Planche", repsReq: 22, type: 1 },
    { name: "One Leg Tuck Planche", repsReq: 12, type: 1 },
    { name: "Wide Leg Planche", repsReq: 10, type: 1 },
    "Push",
    ""
  ];

  const firstPullUps = [
    "First Pull Ups",
    { name: "Dead Hang", repsReq: 20, type: 1 },
    { name: "Scapula Pull Ups", repsReq: 10, type: 0 },
    { name: "Negative Pull Ups", repsReq: 10, type: 0 },
    "Pull",
    ""
  ];
  
  const backLever = [
    "Back Lever",
    { name: "Pull Ups", repsReq: 10, type: 0 },
    { name: "Tuck Back Lever", repsReq: 20, type: 1 },
    { name: "Vertical Straddle Legs to Tuck Back Lever", repsReq: 6, type: 0 },
    { name: "Advance Tuck Back Lever", repsReq: 10, type: 1 },
    { name: "Straddle Back Lever Negatives", repsReq: 6, type: 1 },
    { name: "Straddle Back Lever", repsReq: 10, type: 0 },
    "Push",
    ""
  ];
  
  const frontLever = [
    "Front Lever",
    { name: "Tuck", repsReq: 12, type: 1 },
    { name: "Advanced Tuck", repsReq: 10, type: 0 },
    { name: "One Leg Front Lever", repsReq: 15, type: 1 },
    { name: "Straddle Front Lever", repsReq: 10, type: 1 },
    "Pull",
    ""
  ];
  
  const sissySquats = [
    "Sissy Squats",
    { name: "Body Weight Squats", repsReq: 20, type: 0 },
    { name: "Negative Sissy Squats", repsReq: 15, type: 0 },
    { name: "Assisted Sissy Squats", repsReq: 10, type: 0 },
    "Legs",
    ""
  ];
  
  const shrimpSquats = [
    "Shrimp Squats",
    { name: "Lunges", repsReq: 20, type: 0 },
    { name: "assisted shrimp squats", repsReq: 10, type: 0 },
    "Legs",
    ""
  ];
  
  const pistolSquat = [
    "Pistol Squat",
    { name: "Bulgarian Split Squats", repsReq: 15, type: 0 },
    { name: "Box Pistol Squats", repsReq: 8, type: 0 },
    { name: "Assisted Pistol Squat", repsReq: 5, type: 0 },
    "legs",
    ""
  ];
  
  // Combine all arrays into a single array and export
  const skills = [
    firstPullUps,
    elbowLever,
    handstand,
    planche,
    backLever,
    frontLever,
    sissySquats,
    shrimpSquats,
    pistolSquat
  ];
  
  module.exports = skills;