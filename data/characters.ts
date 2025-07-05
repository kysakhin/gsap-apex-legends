export interface Character {
  name: string;
  title: string;
  image: string;
  themeColor: string;
  description: string;
  abilities: {
    tactical: string;
    passive: string;
    ultimate: string;
  };
  nextCharacter: {
    name: string;
    image: string;
  };
}

export const characters: Character[] = [
  {
    name: "BLOODHOUND",
    title: "Technological Tracker",
    image: "/bloodhound.png",
    description:
      "Bloodhound is known across the Outlands as one of the greatest game hunters the Frontier has ever seen – and that's about all anyone knows. Their identity is a mystery wrapped in layers of rumors.",
    themeColor: "#D13A3A", // Red
    abilities: {
      tactical: "ALLFATHER EYE",
      passive: "TRACKER",
      ultimate: "BEAST OF THE HUNT",
    },
    nextCharacter: {
      name: "MIRAGE",
      image: "/Mirage.png",
    },
  },
  {
    name: "MIRAGE",
    title: "Holographic Trickster",
    image: "/Mirage.png",
    description:
      "Mirage is the kind of guy who likes to stand out. The youngest of four brothers, he perfected the art of fooling around to get attention. The one thing he took seriously was Holo-Pilot technology.",
    themeColor: "#E2A648", // Gold/Yellow
    abilities: {
      tactical: "PSYCHE OUT",
      passive: "NOW YOU SEE ME...",
      ultimate: "LIFE OF THE PARTY",
    },
    nextCharacter: {
      name: "WRAITH",
      image: "/wraith.png",
    },
  },
  {
    name: "WRAITH",
    title: "Interdimensional Skirmisher",
    image: "/wraith.png",
    description:
      "Wraith is a whirlwind fighter, able to execute deadly attacks and manipulate spacetime by opening rifts in the fabric of reality — but she has no idea how she got that way.",
    themeColor: "#55467A", // Purple/Indigo
    abilities: {
      tactical: "INTO THE VOID",
      passive: "VOICES FROM THE VOID",
      ultimate: "DIMENSIONAL RIFT",
    },
    nextCharacter: {
      name: "LIFELINE", // updated
      image: "/lifeline.png",
    },
  },
  {
    name: "LIFELINE",
    title: "Combat Medic",
    image: "/lifeline.png",
    description:
      "Ajay Che, aka Lifeline, is a combat medic who has dedicated her life to helping others. She uses her D.O.C. drone to heal her teammates in the heat of battle.",
    themeColor: "#85C8D4", // Teal/Light Blue
    abilities: {
      tactical: "D.O.C. HEAL DRONE",
      passive: "COMBAT REVIVE",
      ultimate: "CARE PACKAGE",
    },
    nextCharacter: {
      name: "PATHFINDER",
      image: "/pathfinder.png",
    },
  },
  {
    name: "PATHFINDER",
    title: "Forward Scout",
    image: "/pathfinder.png",
    description:
      "Pathfinder is the picture of optimism, despite having no idea who created him or why. He's on a journey to find his creator, joining the Apex Games to gain a following and hopefully draw their attention.",
    themeColor: "#75B9EF", // Sky Blue
    abilities: {
      tactical: "GRAPPLING HOOK",
      passive: "INSIDER KNOWLEDGE",
      ultimate: "ZIPLINE GUN",
    },
    nextCharacter: {
      name: "OCTANE",
      image: "/octane.png",
    },
  },
  {
    name: "OCTANE",
    title: "High-Speed Daredevil",
    image: "/octane.png",
    description:
      "After blowing off his legs in a record-breaking gauntlet run, Octavio “Octane” Silva is seeking his next adrenaline rush. With his metallic legs, he's faster, and with his Stim, he's never standing still.",
    themeColor: "#9BF54E", // Lime Green
    abilities: {
      tactical: "STIM",
      passive: "SWIFT MEND",
      ultimate: "LAUNCH PAD",
    },
    nextCharacter: {
      name: "BLOODHOUND", // Loops back to the beginning
      image: "/bloodhound.png",
    },
  },
];