const makeTags = (name, secret, role) => [name, secret, role];
const characters = window.faceGenerator.createCharacters(makeTags, []);
const traitBook = window.faceGenerator.traitBook;
const expressions = traitBook.expressions;
const accessoryChoices = traitBook.accessories;
const correctionStorageKey = "who-is-that-face-corrections";
const selectedFaceStorageKey = "who-is-that-last-selected-face";
const sharedEditor = window.WhoEditorShared || {};
const titleCase = sharedEditor.titleCase || ((value) => String(value)
  .replace(/([a-z])([A-Z])/g, "$1 $2")
  .replace(/[-_]+/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase()));
const selectOptions = sharedEditor.selectOptions || ((list) => (list || []).map((value) => [value, titleCase(value)]));
const sharedGroupOrder = Array.isArray(sharedEditor.groupOrder) && sharedEditor.groupOrder.length
  ? sharedEditor.groupOrder.slice()
  : null;
const sharedGroupTitle = (group) => (sharedEditor.groupTitleMap && sharedEditor.groupTitleMap[group]) || group;

const editorFields = sharedEditor.fieldsForFaceStudio
  ? sharedEditor.fieldsForFaceStudio(traitBook, accessoryChoices)
  : [
  // Face
  { group: "Structure", key: "faceShape", label: "Face Shape", type: "select", options: () => selectOptions(traitBook.faceShapes), fallback: "oval" },
  { group: "Structure", key: "headScaleX", label: "Head Width", min: 0.85, max: 1.18, step: 0.01, fallback: 1 },
  { group: "Structure", key: "headScaleY", label: "Head Height", min: 0.85, max: 1.18, step: 0.01, fallback: 1 },
  { group: "Structure", key: "neckWidth", label: "Neck Width", min: 0.72, max: 1.38, step: 0.01, fallback: 1 },
  { group: "Structure", key: "neckTaper", label: "Neck Taper", min: -1, max: 1, step: 0.05, fallback: 0 },
  { group: "Structure", key: "neckLength", label: "Neckline Height", min: -8, max: 16, step: 0.5, fallback: 0 },
  { group: "Structure", key: "neckOutline", label: "Neck Outline", type: "select", options: () => [["on", "On"], ["off", "Off"]], fallback: "on" },
  { group: "Structure", key: "neckOutlineWidth", label: "Neck Outline Width", min: 0.5, max: 3, step: 0.05, fallback: 1 },
  { group: "Structure", key: "neckTerminationY", label: "Neck Join Depth", min: -6, max: 12, step: 0.5, fallback: 0 },
  { group: "Face Lines", key: "adamAppleStyle", label: "Adam's Apple", type: "select", options: () => [["off", "Off"], ["soft", "Soft"], ["line", "Line"], ["notch", "Notch"]], fallback: "off" },
  { group: "Face Lines", key: "adamAppleScale", label: "Adam's Apple Size", min: 0.5, max: 1.8, step: 0.05, fallback: 1 },
  { group: "Face Lines", key: "adamAppleOpacity", label: "Adam's Apple Opacity", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Face Lines", key: "adamAppleY", label: "Adam's Apple Y", min: -10, max: 10, step: 0.5, fallback: 0 },
  { group: "Structure", key: "headTilt", label: "Head Tilt", min: -12, max: 12, step: 0.5, fallback: 0 },
  { group: "Structure", key: "headY", label: "Head Position", min: -10, max: 10, step: 1, fallback: 0 },
  { group: "Structure", key: "eyeGap", label: "Eye Gap", min: 40, max: 62, step: 1, fallback: 47 },
  // Skin
  { group: "Skin", key: "skin", label: "Skin Tone", type: "select", options: () => selectOptions(traitBook.skinTones), fallback: "fair" },
  { group: "Skin", key: "background", label: "Background", type: "color", fallback: "" },
  // Lighting
  { group: "Lighting", key: "castShadowPreset", label: "Cast Shadow", type: "select", options: () => selectOptions(traitBook.castShadowPresets || ["off", "hairline", "sweptLeft", "sweptRight", "capBrim", "sideLeft", "sideRight", "beardJaw"]), fallback: "off" },
  { group: "Lighting", key: "castShadowOpacity", label: "Shadow Opacity", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Lighting", key: "castShadowAngle", label: "Shadow Angle", min: -45, max: 45, step: 1, fallback: 0 },
  { group: "Lighting", key: "castShadowSoftness", label: "Shadow Softness", min: 0.6, max: 2.2, step: 0.05, fallback: 1 },
  { group: "Lighting", key: "castShadowX", label: "Shadow X", min: -20, max: 20, step: 1, fallback: 0 },
  { group: "Lighting", key: "castShadowY", label: "Shadow Y", min: -20, max: 20, step: 1, fallback: 0 },
  // Hair
  { group: "Hair", key: "hair", label: "Hair Style", type: "select", options: () => selectOptions(traitBook.hairStyles), fallback: "messy" },
  { group: "Hair", key: "hairColor", label: "Hair Color", type: "select", options: () => selectOptions(traitBook.hairColors), fallback: "brown" },
  { group: "Hair", key: "hairOutlineMode", label: "Hair Outline", type: "select", options: () => [["on", "On"], ["off", "Off"]], fallback: "on" },
  { group: "Hair", key: "hairOutline", label: "Hair Outline Colour", type: "color", fallback: "" },
  { group: "Hair", key: "hairOutlineWidth", label: "Hair Outline Width", min: 0.55, max: 1.8, step: 0.05, fallback: 1 },
  { group: "Hair", key: "frontHairY", label: "Front Hair Y", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Hair", key: "backHairY", label: "Back Hair Y", min: -14, max: 14, step: 1, fallback: 0,
    when: (t) => ["longWaves", "bun", "hijab"].includes(t.hair) || !(window.facesHair && window.facesHair.has(t.hair)) },
  { group: "Hair", key: "lockBlend", label: "Lock Blending", type: "select", options: () => [["merged", "Merged"], ["separate", "Separate"]], fallback: "merged" },
  // Brows
  { group: "Brows", key: "browShape", label: "Brow Shape", type: "select", options: () => selectOptions(traitBook.browShapes), fallback: "soft" },
  { group: "Brows", key: "browY", label: "Brow Height", min: -6, max: 6, step: 0.5, fallback: 0 },
  { group: "Brows", key: "browScaleX", label: "Brow Width", min: 0.8, max: 1.25, step: 0.02, fallback: 1 },
  { group: "Brows", key: "browThick", label: "Brow Thickness", min: 0.5, max: 2, step: 0.05, fallback: 1 },
  { group: "Brows", key: "browAngle", label: "Brow Angle", min: -25, max: 25, step: 1, fallback: 0 },
  { group: "Brows", key: "browLeftAngle", label: "Left Brow Angle", min: -30, max: 30, step: 1, fallback: 0 },
  { group: "Brows", key: "browRightAngle", label: "Right Brow Angle", min: -30, max: 30, step: 1, fallback: 0 },
  // Eyes
  { group: "Eyes", key: "eyeScale", label: "Eye Size", min: 0.7, max: 1.25, step: 0.02, fallback: 0.94 },
  { group: "Eyes", key: "eyeOpen", label: "Eye Openness", min: 0.5, max: 1.2, step: 0.02, fallback: 0.95 },
  { group: "Eyes", key: "irisScale", label: "Iris Size", min: 0.7, max: 1.2, step: 0.02, fallback: 0.92 },
  { group: "Eyes", key: "eyeColor", label: "Iris Colour", type: "color", fallback: "" },
  { group: "Eyes", key: "eyeY", label: "Eye Height", min: -8, max: 8, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "eyeX", label: "Eye Group X", min: -12, max: 12, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "eyeLeftX", label: "Left Eye X", min: -12, max: 12, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "eyeRightX", label: "Right Eye X", min: -12, max: 12, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "eyeLeftY", label: "Left Eye Y", min: -8, max: 8, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "eyeRightY", label: "Right Eye Y", min: -8, max: 8, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "pupilX", label: "Pupil X", min: -5, max: 5, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "pupilY", label: "Pupil Y", min: -5, max: 5, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "lazyEye", label: "Lazy Eye", min: -8, max: 8, step: 0.5, fallback: 0 },
  { group: "Eyes", key: "eyeDart", label: "Eye Movement (dart range)", min: 0, max: 1, step: 0.02, fallback: 0.6 },
  { group: "Eyes", key: "lashes", label: "Eyelashes", min: 0, max: 1.6, step: 0.05, fallback: 0 },
  { group: "Eyes", key: "eyelashThickness", label: "Eyelash Thickness", min: 0.7, max: 4, step: 0.1, fallback: 2 },
  { group: "Eyes", key: "eyelashDensity", label: "Eyelash Density", min: 0.35, max: 3, step: 0.05, fallback: 1 },
  { group: "Eyes", key: "eyelashCurl", label: "Eyelash Curl", min: 0, max: 1.5, step: 0.05, fallback: 0.75 },
  { group: "Eyes", key: "eyelashCoverage", label: "Eyelash Coverage", type: "select", options: () => [["quarter", "Quarter Lid"], ["half", "Half Lid"], ["full", "Full Lid"]], fallback: "quarter" },
  { group: "Eyes", key: "eyelashColor", label: "Eyelash Colour", type: "color", fallback: "" },
  { group: "Eyes", key: "eyeshadowOpacity", label: "Eyeshadow", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Eyes", key: "eyeshadowColor", label: "Eyeshadow Colour", type: "color", fallback: "" },
  { group: "Eyes", key: "upperEyelidWidth", label: "Upper Eyelid Width", min: 0.6, max: 3.8, step: 0.1, fallback: 1 },
  { group: "Eyes", key: "lowerEyelidWidth", label: "Lower Eyelid Width", min: 0.5, max: 3, step: 0.1, fallback: 1 },
  { group: "Eyes", key: "undershadowOpacity", label: "Under-eye Shadow", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Eyes", key: "undershadowY", label: "Under-eye Shadow Y", min: -10, max: 8, step: 0.5, fallback: -3 },
  { group: "Eyes", key: "undershadowWidth", label: "Under-eye Shadow Width", min: 0.5, max: 1.8, step: 0.05, fallback: 1 },
  { group: "Eyes", key: "underEyeWidth", label: "Under-eye Line Width", min: 0.5, max: 1.8, step: 0.05, fallback: 1 },
  // Nose
  { group: "Nose", key: "noseY", label: "Nose Height", min: -8, max: 10, step: 0.5, fallback: 0 },
  { group: "Nose", key: "noseScale", label: "Nose Size", min: 0.6, max: 1.5, step: 0.02, fallback: 1 },
  { group: "Nose", key: "noseLength", label: "Nose Length", min: 0.65, max: 1.5, step: 0.02, fallback: 1 },
  { group: "Nose", key: "noseWidth", label: "Nose Width (skinny ↔ broad)", min: 0.55, max: 1.5, step: 0.02, fallback: 1 },
  { group: "Nose", key: "noseTip", label: "Tip Shape", type: "select", options: () => selectOptions(traitBook.noseTips), fallback: "round" },
  // Face Lines (creases/wrinkles - each 0..1 opacity; faceLineOpacity scales them all)
  { group: "Face Lines", key: "faceLineOpacity", label: "All Lines (master)", min: 0, max: 1, step: 0.05, fallback: 1 },
  { group: "Face Lines", key: "nasoOpacity", label: "Nasolabial Folds", min: 0, max: 1, step: 0.05, fallback: 0.55 },
  { group: "Face Lines", key: "foreheadLineOpacity", label: "Forehead Wrinkles", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Face Lines", key: "frownLineOpacity", label: "Frown Lines (glabella)", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Face Lines", key: "underEyeOpacity", label: "Under-Eye Bags", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Face Lines", key: "underEyeY", label: "Under-Eye Line Y", min: -10, max: 8, step: 0.5, fallback: -3 },
  { group: "Face Lines", key: "underEyeLineWidth", label: "Under-Eye Line Width", min: 0.6, max: 3, step: 0.1, fallback: 1.3 },
  { group: "Face Lines", key: "crowsFeetOpacity", label: "Crow's Feet", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Face Lines", key: "marionetteOpacity", label: "Marionette Lines", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Face Lines", key: "cheekLineOpacity", label: "Cheek Hollows", min: 0, max: 1, step: 0.05, fallback: 0 },
  // Cheeks
  { group: "Cheeks", key: "cheekY", label: "Blush Height", min: -8, max: 8, step: 0.5, fallback: 0 },
  { group: "Cheeks", key: "cheekOpacity", label: "Blush", min: 0, max: 0.5, step: 0.01, fallback: 0.09 },
  { group: "Cheeks", key: "blushColor", label: "Blush Colour", type: "color", fallback: "" },
  { group: "Cheeks", key: "blushScale", label: "Blush Size", min: 0.4, max: 2, step: 0.05, fallback: 1 },
  { group: "Cheeks", key: "blushX", label: "Blush Spacing", min: -18, max: 18, step: 0.5, fallback: 0 },
  { group: "Structure", key: "contourOpacity", label: "Cheek Contour", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Structure", key: "contourY", label: "Contour Y", min: -14, max: 14, step: 0.5, fallback: 0 },
  { group: "Structure", key: "contourX", label: "Contour Spacing", min: -18, max: 18, step: 0.5, fallback: 0 },
  { group: "Structure", key: "contourWidth", label: "Contour Width", min: 0.55, max: 1.8, step: 0.05, fallback: 1 },
  // Ears
  { group: "Structure", key: "earVariant", label: "Ear Shape", type: "select", options: () => selectOptions(traitBook.earVariants), fallback: "round" },
  { group: "Structure", key: "earScale", label: "Ear Size", min: 0.7, max: 1.3, step: 0.02, fallback: 1 },
  { group: "Structure", key: "earY", label: "Ear Height", min: -10, max: 10, step: 1, fallback: 0 },
  { group: "Structure", key: "earX", label: "Ear Group X", min: -12, max: 12, step: 0.5, fallback: 0 },
  { group: "Structure", key: "earLeftX", label: "Left Ear X", min: -14, max: 14, step: 0.5, fallback: 0 },
  { group: "Structure", key: "earRightX", label: "Right Ear X", min: -14, max: 14, step: 0.5, fallback: 0 },
  { group: "Structure", key: "earLeftY", label: "Left Ear Y", min: -14, max: 14, step: 0.5, fallback: 0 },
  { group: "Structure", key: "earRightY", label: "Right Ear Y", min: -14, max: 14, step: 0.5, fallback: 0 },
  { group: "Structure", key: "earRot", label: "Ear Rotate", min: -20, max: 20, step: 1, fallback: 0 },
  // Mouth
  { group: "Mouth", key: "mouthStyle", label: "Smile Style", type: "select", options: () => selectOptions(traitBook.mouthStyles), fallback: "warmSmile" },
  { group: "Mouth", key: "smileLips", label: "Smile Lips", type: "select", options: () => [["on", "On"], ["off", "Off"]], fallback: "on" },
  { group: "Mouth", key: "lips", label: "Lip Shape", type: "select", options: () => selectOptions(traitBook.lipStyles), fallback: "line" },
  { group: "Mouth", key: "lipUpper", label: "Upper Lip Design", type: "select", options: () => selectOptions(traitBook.lipUppers), fallback: "soft" },
  { group: "Mouth", key: "lipLower", label: "Lower Lip Design", type: "select", options: () => selectOptions(traitBook.lipLowers), fallback: "round" },
  { group: "Mouth", key: "lipLineWidth", label: "Lip Line Width", min: 0.3, max: 3, step: 0.05, fallback: 1 },
  { group: "Mouth", key: "lipUpperSize", label: "Upper Lip Size", min: 0.4, max: 1.8, step: 0.05, fallback: 1 },
  { group: "Mouth", key: "lipLowerSize", label: "Lower Lip Size", min: 0.4, max: 1.8, step: 0.05, fallback: 1 },
  { group: "Mouth", key: "smileLowerLipCurve", label: "Smile Lower Lip Curve", min: -0.8, max: 1.4, step: 0.05, fallback: 0 },
  { group: "Mouth", key: "lipColor", label: "Lip Colour", type: "color", fallback: "" },
  { group: "Mouth", key: "mouthOpenW", label: "Open Mouth Width", min: 0.5, max: 1.7, step: 0.05, fallback: 1,
    when: (t) => { const e = (window.faceGenerator && window.faceGenerator.traitBook.expressions) || {}; return !!(e[t.expression] && e[t.expression].openMouth) || ["surprised", "shocked"].includes(t.expression); } },
  { group: "Mouth", key: "mouthOpenH", label: "Open Mouth Height", min: 0.5, max: 1.9, step: 0.05, fallback: 1,
    when: (t) => { const e = (window.faceGenerator && window.faceGenerator.traitBook.expressions) || {}; return !!(e[t.expression] && e[t.expression].openMouth) || ["surprised", "shocked"].includes(t.expression); } },
  { group: "Mouth", key: "mouthY", label: "Mouth Y", min: -16, max: 18, step: 1, fallback: 0 },
  { group: "Mouth", key: "mouthScale", label: "Mouth Size", min: 0.72, max: 1.28, step: 0.02, fallback: 1 },
  // Teeth
  { group: "Teeth", key: "teethStyle", label: "Teeth Style", type: "select", options: () => selectOptions(traitBook.teethStyles), fallback: "even" },
  { group: "Teeth", key: "teethGap", label: "Front Gap", min: 0, max: 10, step: 0.5, fallback: 0 },
  { group: "Teeth", key: "teethOverhang", label: "Bucky Overhang", min: 0, max: 14, step: 0.5, fallback: 0 },
  { group: "Teeth", key: "teethX", label: "Teeth X", min: -16, max: 16, step: 1, fallback: 0 },
  { group: "Teeth", key: "teethY", label: "Teeth Y", min: -14, max: 14, step: 1, fallback: 0 },
  { group: "Teeth", key: "teethScale", label: "Teeth Size", min: 0.62, max: 1.38, step: 0.02, fallback: 1 },
  // Jaw / chin structure
  { group: "Structure", key: "jawLength", label: "Jaw Length", min: -0.25, max: 0.4, step: 0.01, fallback: 0 },
  { group: "Structure", key: "jawShadowY", label: "Jaw Shadow", min: -6, max: 6, step: 0.5, fallback: 0 },
  { group: "Structure", key: "chinShape", label: "Chin Shape", type: "select", options: () => selectOptions(traitBook.chinShapes), fallback: "none" },
  { group: "Structure", key: "chinY", label: "Chin Height", min: -16, max: 18, step: 1, fallback: 0 },
  { group: "Structure", key: "chinWidth", label: "Chin Width", min: 0.6, max: 1.7, step: 0.02, fallback: 1 },
  { group: "Structure", key: "chinScale", label: "Chin Size", min: 0.5, max: 2, step: 0.02, fallback: 1 },
  // Clothing
  { group: "Clothing", key: "clothing", label: "Outfit", type: "select", options: () => selectOptions(traitBook.clothing), fallback: "tee" },
  { group: "Clothing", key: "shirt", label: "Clothing Colour", type: "color", fallback: "" },
  { group: "Clothing", key: "build", label: "Build (shoulder width)", min: 60, max: 100, step: 1, fallback: 82 },
  { group: "Clothing", key: "shoulderSlope", label: "Shoulder Slope", min: 0, max: 1, step: 0.02, fallback: 0.5 },
  { group: "Clothing", key: "bodyWidth", label: "Body Width (torso)", min: 0.7, max: 1.4, step: 0.01, fallback: 1 },
  { group: "Clothing", key: "belly", label: "Belly", min: 0, max: 1, step: 0.05, fallback: 0 },
  { group: "Clothing", key: "bust", label: "Bust", min: 0, max: 1.5, step: 0.05, fallback: 0 },
  // Accessory
  { group: "Accessory", key: "accessory", label: "Accessory", type: "select", options: () => selectOptions(accessoryChoices), fallback: "none" },
  { group: "Accessory", key: "accessoryColor", label: "Accessory Colour", type: "color", fallback: "" },
  { group: "Accessory", key: "accessoryMetal", label: "Chain Metal", type: "select", options: () => [["", "Auto"], ["silver", "Silver"], ["gold", "Gold"], ["black", "Black"], ["roseGold", "Rose Gold"]], fallback: "" },
  { group: "Accessory", key: "chainLink", label: "Chain Link Size", min: 0.5, max: 2.2, step: 0.05, fallback: 1 },
  { group: "Accessory", key: "accessoryX", label: "Accessory X", min: -24, max: 24, step: 1, fallback: 0 },
  { group: "Accessory", key: "accessoryY", label: "Accessory Y", min: -24, max: 24, step: 1, fallback: 0 },
  { group: "Accessory", key: "accessoryScale", label: "Accessory Size", min: 0.68, max: 1.36, step: 0.02, fallback: 1 },
  { group: "Accessory", key: "accessoryRot", label: "Accessory Rotate", min: -45, max: 45, step: 1, fallback: 0 },
  { group: "Accessory", key: "accessoryLayer", label: "Accessory Layer", type: "select", options: () => [["auto", "Auto"], ["beforeHead", "Behind Head"], ["behindHair", "Behind Hair"], ["beforeMouth", "Before Mouth"], ["afterMouth", "Front"]], fallback: "auto" },
  // Beard
  { group: "Beard", key: "beardLength", label: "Beard Length", min: 0, max: 1, step: 0.02, fallback: 0.35 },
  { group: "Beard", key: "beardX", label: "Beard X", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Beard", key: "beardY", label: "Beard Y", min: -18, max: 22, step: 1, fallback: 0 },
  { group: "Beard", key: "beardScale", label: "Beard Scale", min: 0.72, max: 1.42, step: 0.02, fallback: 1 },
  { group: "Beard", key: "beardSkewX", label: "Beard Skew X", min: -30, max: 30, step: 1, fallback: 0 },
  { group: "Beard", key: "beardSkewY", label: "Beard Skew Y", min: -30, max: 30, step: 1, fallback: 0 },
  // Animation (per-character idle motion)
  { group: "Animation", key: "animMode", label: "Animation", type: "select", options: () => selectOptions(traitBook.animModes), fallback: "still" },
  { group: "Animation", key: "blinkRate", label: "Blink Every (s)", min: 0, max: 12, step: 0.5, fallback: 4.5 },
  { group: "Animation", key: "winkRate", label: "Wink Every (s)", min: 0, max: 30, step: 1, fallback: 0 },
  // Moustache
  { group: "Moustache", key: "moustacheX", label: "Moustache X", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Moustache", key: "moustacheY", label: "Moustache Y", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Moustache", key: "moustacheScale", label: "Moustache Size", min: 0.62, max: 1.5, step: 0.02, fallback: 1 },
  // Tattoo (custom text on the chest/neck)
  { group: "Tattoo", key: "tattooText", label: "Text", type: "text", fallback: "" },
  { group: "Tattoo", key: "tattooPlace", label: "Placement", type: "select", options: () => selectOptions(traitBook.tattooPlaces), fallback: "body" },
  { group: "Tattoo", key: "tattooFont", label: "Font", type: "select", options: () => selectOptions(traitBook.tattooFonts), fallback: "bold" },
  { group: "Tattoo", key: "tattooColor", label: "Colour", type: "color", fallback: "" },
  { group: "Tattoo", key: "tattooX", label: "X", min: -70, max: 70, step: 1, fallback: 0 },
  { group: "Tattoo", key: "tattooY", label: "Y", min: -40, max: 20, step: 1, fallback: 0 },
  { group: "Tattoo", key: "tattooScale", label: "Size", min: 0.4, max: 3, step: 0.05, fallback: 1 },
  { group: "Tattoo", key: "tattooRot", label: "Rotate", min: -60, max: 60, step: 1, fallback: 0 },
  { group: "Tattoo", key: "tattooSkewX", label: "Skew", min: -45, max: 45, step: 1, fallback: 0 },
  { group: "Tattoo", key: "tattooWarp", label: "Warp", min: 0, max: 1, step: 0.02, fallback: 0 },
  { group: "Tattoo", key: "tattooOpacity", label: "Fade", min: 0, max: 1, step: 0.05, fallback: 1 },
  { group: "Tattoo", key: "tattooLayer", label: "Layer", type: "select", options: () => [["overClothes", "Over Clothes"], ["onSkin", "On Skin"]], fallback: "overClothes" }
];

if (!editorFields.some((field) => field.key === "neckDebug")) {
  editorFields.splice(
    Math.max(0, editorFields.findIndex((field) => field.key === "headTilt")),
    0,
    { group: "Structure", key: "neckDebug", label: "Neck Debug", type: "select", options: () => [["off", "Off"], ["fill", "Fill"], ["outline", "Outline"], ["all", "All"]], fallback: "off" }
  );
}

const hotspots = [
  { label: "Structure", group: "Structure", left: 2, top: 2, width: 18, height: 10 },
  { label: "Hair", group: "Hair", left: 22, top: 2, width: 56, height: 24 },
  { label: "Structure", group: "Structure", left: 4, top: 46, width: 14, height: 18 },
  { label: "Structure", group: "Structure", left: 82, top: 46, width: 14, height: 18 },
  { label: "Brows", group: "Brows", left: 26, top: 36, width: 48, height: 10 },
  { label: "Eyes", group: "Eyes", left: 26, top: 44, width: 48, height: 12 },
  { label: "Nose", group: "Nose", left: 40, top: 52, width: 20, height: 16 },
  { label: "Cheeks", group: "Cheeks", left: 18, top: 54, width: 18, height: 14 },
  { label: "Cheeks", group: "Cheeks", left: 64, top: 54, width: 18, height: 14 },
  { label: "Mouth", group: "Mouth", left: 36, top: 64, width: 28, height: 10 },
  { label: "Structure", group: "Structure", left: 28, top: 72, width: 44, height: 18 },
  { label: "Outfit", group: "Clothing", left: 20, top: 88, width: 60, height: 12 }
];

const state = {
  expression: "assigned",
  hair: "all",
  accessory: "all",
  search: "",
  groupBy: "none",
  matrix: false,
  selectedId: readSelectedFaceId(),
  selectedExpression: "assigned",
  activeGroup: "Structure",
  exportMode: "corrections",
  corrections: cleanStoredCorrections(readCorrections()),
  // Pen tool (draw custom hair). pts: anchors {x,y,hx,hy} in 256-space; hx/hy = outgoing handle.
  pen: { mode: false, pts: [], dragging: -1, color: "", outline: true, lines: true, closed: false }
};

const rosterGroupOptions = [
  ["none", "None"],
  ["skinTone", "Skin Tone"],
  ["expression", "Expression"],
  ["accessory", "Accessory"],
  ["hair", "Hair"],
  ["backgroundWarmth", "Background Warmth"],
  ["shirtColor", "Shirt Colour"]
];

const rosterGroupOrder = {
  skinTone: ["Fair", "Light", "Medium", "Tan", "Deep"],
  expression: expressions.map((expression) => titleCase(expression)),
  backgroundWarmth: ["Cool", "Neutral", "Warm"],
  shirtColor: ["Black", "Grey", "White", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink"]
};

const editorNavFamilies = [
  { label: "Base", groups: ["Structure", "Skin", "Lighting", "Face Lines", "Cheeks"] },
  { label: "Features", groups: ["Brows", "Eyes", "Nose", "Mouth", "Teeth"] },
  { label: "Styling", groups: ["Hair", "Beard", "Moustache", "Clothing", "Accessory", "Jewellery", "Tattoo", "Animation"] }
];

const PEN_LOCK_KEY = "who-is-that-pen-locks";
function readPenLocks() {
  try { return JSON.parse(localStorage.getItem(PEN_LOCK_KEY)) || []; } catch (e) { return []; }
}
function savePenLocks(list) { localStorage.setItem(PEN_LOCK_KEY, JSON.stringify(list)); }

const editorGroups = (sharedGroupOrder || [...new Set(editorFields.map((field) => field.group))])
  .filter((group, index, all) => all.indexOf(group) === index)
  .filter((group) => editorFields.some((field) => field.group === group) || ["Tattoo", "Jewellery", "Lighting"].includes(group));

const els = {
  expressionFilter: document.querySelector("#expressionFilter"),
  hairFilter: document.querySelector("#hairFilter"),
  accessoryFilter: document.querySelector("#accessoryFilter"),
  groupByFilter: document.querySelector("#groupByFilter"),
  searchInput: document.querySelector("#searchInput"),
  matrixToggle: document.querySelector("#matrixToggle"),
  resetButton: document.querySelector("#resetButton"),
  faceGrid: document.querySelector("#faceGrid"),
  resultCount: document.querySelector("#resultCount"),
  rosterMeta: document.querySelector("#rosterMeta"),
  selectedPortrait: document.querySelector("#selectedPortrait"),
  selectedMeta: document.querySelector("#selectedMeta"),
  variantStrip: document.querySelector("#variantStrip"),
  portraitHotspots: document.querySelector("#portraitHotspots"),
  lockOverlay: document.querySelector("#lockOverlay"),
  penOverlay: document.querySelector("#penOverlay"),
  hotspotHint: document.querySelector("#hotspotHint"),
  editorControls: document.querySelector("#editorControls"),
  correctionExport: document.querySelector("#correctionExport"),
  combinedCorrectionExport: document.querySelector("#combinedCorrectionExport"),
  exportModeLabel: document.querySelector("#exportModeLabel"),
  combinedExportLabel: document.querySelector("#combinedExportLabel"),
  exportModeCorrections: document.querySelector("#exportModeCorrections"),
  exportModeEdited: document.querySelector("#exportModeEdited"),
  copyExportButton: document.querySelector("#copyExportButton"),
  copyCombinedExportButton: document.querySelector("#copyCombinedExportButton"),
  resetAllCorrectionsButton: document.querySelector("#resetAllCorrectionsButton"),
  resetCorrectionButton: document.querySelector("#resetCorrectionButton")
};
let portraitRefreshFrame = 0;
let pendingPortraitRefresh = null;

init();

function init() {
  fillSelect(els.expressionFilter, [
    ["assigned", "Assigned"],
    ...expressions.map((expression) => [expression, titleCase(expression)])
  ]);
  fillSelect(els.hairFilter, [["all", "All"], ...optionsFrom("hair")]);
  fillSelect(els.accessoryFilter, [["all", "All"], ...optionsFrom("accessory")]);
  fillSelect(els.groupByFilter, rosterGroupOptions);

  els.expressionFilter.addEventListener("change", () => {
    state.expression = els.expressionFilter.value;
    state.selectedExpression = state.expression;
    render();
  });
  els.hairFilter.addEventListener("change", () => {
    state.hair = els.hairFilter.value;
    render();
  });
  els.accessoryFilter.addEventListener("change", () => {
    state.accessory = els.accessoryFilter.value;
    render();
  });
  els.groupByFilter.addEventListener("change", () => {
    state.groupBy = els.groupByFilter.value;
    render();
  });
  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value.trim().toLowerCase();
    render();
  });
  els.matrixToggle.addEventListener("change", () => {
    state.matrix = els.matrixToggle.checked;
    render();
  });
  els.resetButton.addEventListener("click", reset);
  els.resetCorrectionButton.addEventListener("click", clearSelectedCorrection);
  els.exportModeCorrections?.addEventListener("click", () => setExportMode("corrections"));
  els.exportModeEdited?.addEventListener("click", () => setExportMode("editedCharacters"));
  els.copyExportButton?.addEventListener("click", copyCurrentExport);
  els.copyCombinedExportButton?.addEventListener("click", copyCombinedExport);
  els.resetAllCorrectionsButton?.addEventListener("click", clearAllCorrections);

  renderHotspots();
  wireLockStageOnce();
  wirePenStageOnce();
  render();
}

function reset() {
  state.expression = "assigned";
  state.hair = "all";
  state.accessory = "all";
  state.search = "";
  state.groupBy = "none";
  state.matrix = false;
  setSelectedFaceId(characters[0]?.id || "");
  state.selectedExpression = "assigned";
  els.expressionFilter.value = state.expression;
  els.hairFilter.value = state.hair;
  els.accessoryFilter.value = state.accessory;
  els.groupByFilter.value = state.groupBy;
  els.searchInput.value = "";
  els.matrixToggle.checked = false;
  render();
}

function render() {
  const visible = filteredCharacters();
  if (!visible.some((character) => character.id === state.selectedId) && visible[0]) {
    setSelectedFaceId(visible[0].id);
    state.selectedExpression = state.expression;
  }
  renderSummary(visible);
  renderGrid(visible);
  renderSelected();
}

function renderSummary(visible) {
  els.resultCount.textContent = `${visible.length} ${visible.length === 1 ? "face" : "faces"}`;
  const groups = groupedCharacters(visible);
  const groupLabel = rosterGroupOptions.find(([value]) => value === state.groupBy)?.[1] || "None";
  els.rosterMeta.textContent = state.groupBy === "none"
    ? `${state.search ? "Search active" : "Flat roster"}`
    : `${groupLabel} · ${groups.length} ${groups.length === 1 ? "cluster" : "clusters"}`;
}

function renderGrid(visible) {
  const previousRects = captureRosterCardRects();
  els.faceGrid.innerHTML = "";
  const groups = groupedCharacters(visible);
  els.faceGrid.classList.toggle("is-grouped", state.groupBy !== "none");
  if (state.groupBy === "none") {
    groups[0]?.items.forEach((character) => els.faceGrid.appendChild(buildFaceCard(character)));
  } else {
    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "face-group";
      section.innerHTML = `
        <div class="face-group-head">
          <h3>${escapeHtml(group.label)}</h3>
          <span>${group.items.length}</span>
        </div>
        <div class="face-group-grid"></div>
      `;
      const grid = section.querySelector(".face-group-grid");
      group.items.forEach((character) => grid.appendChild(buildFaceCard(character)));
      els.faceGrid.appendChild(section);
    });
  }
  animateRosterCards(previousRects);
}

function renderSelected() {
  const character = characters.find((item) => item.id === state.selectedId) || characters[0];
  if (!character) return;
  const index = characters.indexOf(character);
  const expression = selectedExpressionFor(character);
  els.selectedPortrait.innerHTML = `<img src="${portraitFor(character, index, expression)}" alt="${escapeHtml(character.name)}">`;
  renderLockOverlay(character);
  els.selectedMeta.innerHTML = `
    <div class="selected-character-nav">
      <button class="character-nav-button" type="button" data-character-nav="-1" aria-label="Previous character" title="Previous character">&#8592;</button>
      <h2>${escapeHtml(character.name)}</h2>
      <button class="character-nav-button" type="button" data-character-nav="1" aria-label="Next character" title="Next character">&#8594;</button>
    </div>
  `;
  els.selectedMeta.querySelectorAll("[data-character-nav]").forEach((button) => {
    button.addEventListener("click", () => selectAdjacentCharacter(Number(button.dataset.characterNav)));
  });
  els.variantStrip.innerHTML = expressions
    .map((item) => {
      const active = item === expression ? "is-active" : "";
      return `
        <button class="variant-button ${active}" type="button" data-expression="${escapeHtml(item)}" title="${escapeHtml(item)}">
      <img src="${portraitFor(character, index, item)}" alt="${escapeHtml(character.name)} ${escapeHtml(item)}">
        </button>
      `;
    })
    .join("");
  els.variantStrip.querySelectorAll(".variant-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedExpression = button.dataset.expression;
      renderSelected();
    });
  });
  renderEditor(character);
}

function selectAdjacentCharacter(direction) {
  const visible = filteredCharacters();
  if (!visible.length) return;
  const currentIndex = visible.findIndex((character) => character.id === state.selectedId);
  const startIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = (startIndex + direction + visible.length) % visible.length;
  setSelectedFaceId(visible[nextIndex].id);
  state.selectedExpression = state.expression;
  render();
}

function filteredCharacters() {
  return characters.filter((character) => {
    const displayTraits = displayTraitsFor(character);
    const matchesHair = state.hair === "all" || displayTraits.hair === state.hair;
    const matchesAccessory = state.accessory === "all" || displayTraits.accessory === state.accessory;
    const haystack = `${character.name} ${character.feature} ${character.role} ${Object.values(displayTraits).join(" ")}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesHair && matchesAccessory && matchesSearch;
  });
}

function displayTraitsFor(character) {
  return { ...character.traits, ...correctionFor(character.id) };
}

function groupedCharacters(visible) {
  if (state.groupBy === "none") return [{ key: "all", label: "All Faces", items: visible }];
  const grouped = new Map();
  visible.forEach((character) => {
    const traits = displayTraitsFor(character);
    const group = rosterGroupFor(character, traits);
    const key = group.key || "other";
    if (!grouped.has(key)) grouped.set(key, { key, label: group.label, items: [] });
    grouped.get(key).items.push(character);
  });
  return [...grouped.values()]
    .sort((a, b) => compareRosterGroups(state.groupBy, a.label, b.label))
    .map((group) => ({
      ...group,
      items: group.items.slice().sort((a, b) => a.name.localeCompare(b.name))
    }));
}

function rosterGroupFor(character, traits) {
  switch (state.groupBy) {
    case "skinTone":
      return groupBySkinTone(traits);
    case "expression":
      return { key: traits.expression || "assigned", label: titleCase(traits.expression || "assigned") };
    case "accessory":
      return { key: traits.accessory || "none", label: titleCase(traits.accessory || "none") };
    case "hair":
      return { key: traits.hair || "none", label: titleCase(traits.hair || "none") };
    case "backgroundWarmth":
      return groupByWarmth(traits.background || character.traits.background || "#a9c4e0");
    case "shirtColor":
      return groupByColorFamily(traits.shirt || character.traits.shirt || "#8a8e99");
    default:
      return { key: "all", label: "All Faces" };
  }
}

function groupBySkinTone(traits) {
  const toneHex = (traitBook.skinToneHex && traitBook.skinToneHex[traits.skin]) || "#c89070";
  const { l } = rgbToHsl(...Object.values(hexToRgb(toneHex)));
  if (l >= 74) return { key: "fair", label: "Fair" };
  if (l >= 62) return { key: "light", label: "Light" };
  if (l >= 50) return { key: "medium", label: "Medium" };
  if (l >= 36) return { key: "tan", label: "Tan" };
  return { key: "deep", label: "Deep" };
}

function groupByWarmth(color) {
  const { h, s } = rgbToHsl(...Object.values(hexToRgb(color)));
  if (s < 18 || (h >= 45 && h <= 75)) return { key: "neutral", label: "Neutral" };
  if (h >= 170 && h <= 290) return { key: "cool", label: "Cool" };
  return { key: "warm", label: "Warm" };
}

function groupByColorFamily(color) {
  const { h, s, l } = rgbToHsl(...Object.values(hexToRgb(color)));
  if (l <= 14) return { key: "black", label: "Black" };
  if (s <= 12 && l < 82) return { key: "grey", label: "Grey" };
  if (s <= 10 && l >= 82) return { key: "white", label: "White" };
  if (h >= 12 && h < 42 && l < 42) return { key: "brown", label: "Brown" };
  if (h < 16 || h >= 345) return { key: "red", label: "Red" };
  if (h < 38) return { key: "orange", label: "Orange" };
  if (h < 62) return { key: "yellow", label: "Yellow" };
  if (h < 165) return { key: "green", label: "Green" };
  if (h < 255) return { key: "blue", label: "Blue" };
  if (h < 315) return { key: "purple", label: "Purple" };
  if (h < 345) return { key: "pink", label: "Pink" };
  return { key: "brown", label: "Brown" };
}

function compareRosterGroups(groupMode, left, right) {
  const order = rosterGroupOrder[groupMode];
  if (Array.isArray(order)) {
    const leftIndex = order.indexOf(left);
    const rightIndex = order.indexOf(right);
    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    }
  }
  return left.localeCompare(right);
}

function buildFaceCard(character) {
  const sourceIndex = characters.indexOf(character);
  const button = document.createElement("button");
  button.type = "button";
  button.className = `face-card ${state.matrix ? "matrix-card" : ""}`;
  button.dataset.id = character.id;
  button.classList.toggle("is-selected", character.id === state.selectedId);
  button.addEventListener("click", () => {
    setSelectedFaceId(character.id);
    state.selectedExpression = state.expression;
    renderSelected();
    document.querySelectorAll(".face-card").forEach((card) => card.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });

  if (state.matrix) {
    button.innerHTML = `
      ${expressions.map((expression) => `<img src="${portraitFor(character, sourceIndex, expression)}" alt="${escapeHtml(character.name)} ${escapeHtml(expression)}">`).join("")}
      <h3>${escapeHtml(character.name)}</h3>
    `;
  } else {
    const expression = state.expression === "assigned"
      ? displayTraitsFor(character).expression
      : state.expression;
    button.innerHTML = `
      <img src="${portraitFor(character, sourceIndex, expression)}" alt="${escapeHtml(character.name)}">
      <h3>${escapeHtml(character.name)}</h3>
    `;
  }
  return button;
}

function captureRosterCardRects() {
  return new Map(
    [...els.faceGrid.querySelectorAll(".face-card[data-id]")]
      .map((card) => [card.dataset.id, card.getBoundingClientRect()])
  );
}

function animateRosterCards(previousRects) {
  if (!previousRects.size || prefersReducedMotion()) return;
  window.requestAnimationFrame(() => {
    els.faceGrid.querySelectorAll(".face-card[data-id]").forEach((card) => {
      const before = previousRects.get(card.dataset.id);
      if (!before) {
        card.animate(
          [{ opacity: 0, transform: "scale(0.97)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: 200, easing: "ease-out" }
        );
        return;
      }
      const after = card.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      card.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" }
        ],
        { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    });
  });
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function selectedExpressionFor(character) {
  if (state.selectedExpression !== "assigned") return state.selectedExpression;
  if (state.expression !== "assigned") return state.expression;
  return character.traits.expression;
}

function portraitFor(character, index, expression) {
  const traits = traitsFor(character, expression);
  return window.faceGenerator.renderPortrait(index, traits);
}

function traitsFor(character, expression) {
  return { ...character.traits, ...correctionFor(character.id), expression };
}

function optionsFrom(key) {
  return [...new Set(characters.map((character) => character.traits[key]))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => [value, titleCase(value)]);
}

function fillSelect(select, options) {
  select.innerHTML = options
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function toHex(value) {
  if (!value) return "#5a3d28";
  if (value[0] === "#") return value.length === 7 ? value : "#5a3d28";
  const match = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(value);
  if (!match) return "#5a3d28";
  return "#" + [match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex) {
  const clean = toHex(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
      case gn: h = ((bn - rn) / d + 2); break;
      default: h = ((rn - gn) / d + 4); break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  if (!sn) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255)
  };
}

const COLOR_SWATCHES = [
  "#171512", "#1f2330", "#fffdf7", "#8a8e99",
  "#e01b1b", "#1533cc", "#ffbe0b", "#178a47",
  "#3a2418", "#5a3d28", "#8a5a32", "#c98a4b", "#e8c48c", "#f2ddb8",
  "#111111", "#4a4a4a", "#b0b0b0", "#e8e2d4",
  "#ff5a72", "#ff8c42", "#5dff8f", "#4dd2ff", "#c46bff", "#ff2d6f",
  "#73497e", "#2d5a4e", "#7a1f1f", "#0a66c2", "#d25184", "#998880"
];

function colorWidget(key, shown, set) {
  const hex = toHex(shown);
  return `
    <span class="studio-colorwrap">
      <button type="button" class="studio-colorchip" data-swatchfor="${escapeHtml(key)}" style="--chip:${escapeHtml(hex)}" title="Open colour palette" aria-label="${escapeHtml(key)} colour"></button>
      <input id="edit-${escapeHtml(key)}" type="color" value="${escapeHtml(hex)}" data-key="${escapeHtml(key)}" data-kind="color" tabindex="-1" aria-hidden="true">
      <input type="text" class="studio-hex" data-hexfor="${escapeHtml(key)}" value="${escapeHtml(hex)}" maxlength="7" spellcheck="false" aria-label="${escapeHtml(key)} hex colour">
      <button type="button" class="studio-swatchbtn" data-swatchfor="${escapeHtml(key)}" title="Palette">◫</button>
    </span>
  `;
}

function miniSwatchButton(targetId) {
  return `<button type="button" class="mini-swatchbtn" data-inline-swatchfor="${escapeHtml(targetId)}" title="Palette">◫</button>`;
}

function renderEditor(character) {
  const correction = correctionFor(character.id);
  if (!editorGroups.includes(state.activeGroup)) state.activeGroup = editorGroups[0];
  const navFamilies = editorNavFamilies
    .map((family) => ({
      label: family.label,
      groups: family.groups.filter((group) => editorGroups.includes(group))
    }))
    .filter((family) => family.groups.length);
  const nav = `
    <div class="editor-context">
      <span class="meta-label">Now Editing</span>
      <strong>${escapeHtml(sharedGroupTitle(state.activeGroup))}</strong>
    </div>
    <div class="editor-nav-bands">
      ${navFamilies.map((family) => `
        <section class="editor-nav-family">
          <span class="editor-nav-label">${escapeHtml(family.label)}</span>
          <div class="editor-tabs">
            ${family.groups
              .map((group) => `
                <button type="button" class="editor-tab ${group === state.activeGroup ? "is-active" : ""}" data-group="${escapeHtml(group)}">
                  <span>${escapeHtml(sharedGroupTitle(group))}</span>
                </button>
              `)
              .join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;

  const rows = editorFields
    .filter((field) => field.group === state.activeGroup)
    .filter((field) => !(state.activeGroup === "Lighting" && field.group === "Lighting"))
    .filter((field) => !(state.activeGroup === "Jewellery" && field.group === "Jewellery"))
    .filter((field) => !field.when || field.when({ ...character.traits, ...correction }))
    .map((field) => {
    const isDraft = Object.hasOwn(correction, field.key);
    const base = baseValueFor(character, field);
    const value = correction[field.key] ?? base;
    const control = field.type === "select"
      ? `
        <select id="edit-${escapeHtml(field.key)}" data-key="${escapeHtml(field.key)}" data-kind="select">
          ${field.options().map(([optValue, optLabel]) => `<option value="${escapeHtml(optValue)}" ${optValue === value ? "selected" : ""}>${escapeHtml(optLabel)}</option>`).join("")}
        </select>
      `
      : field.type === "color"
      ? (() => {
          const set = correction[field.key] != null && correction[field.key] !== "";
          const shown = set ? correction[field.key] : colorAutoFor(character, field);
          return colorWidget(field.key, shown, set);
        })()
      : field.type === "text"
      ? `
        <input id="edit-${escapeHtml(field.key)}" type="text" value="${escapeHtml(value || "")}" data-key="${escapeHtml(field.key)}" data-kind="text" placeholder="tattoo text" spellcheck="false">
      `
      : `
        <span class="editor-stepper">
          <input
            id="edit-${escapeHtml(field.key)}"
            class="editor-number"
            type="number"
            step="${field.step}"
            value="${escapeHtml(value)}"
            data-key="${escapeHtml(field.key)}"
            data-kind="number"
            aria-label="${escapeHtml(field.label)} value"
          >
          <span class="editor-stepper-buttons">
            <button type="button" data-step-field="${escapeHtml(field.key)}" data-step-direction="1" aria-label="Increase ${escapeHtml(field.label)}" title="Increase">&#9650;</button>
            <button type="button" data-step-field="${escapeHtml(field.key)}" data-step-direction="-1" aria-label="Decrease ${escapeHtml(field.label)}" title="Decrease">&#9660;</button>
          </span>
        </span>
      `;
    return `
      <div class="editor-control ${isDraft ? "is-draft" : ""}" data-group="${escapeHtml(field.group)}" data-field="${escapeHtml(field.key)}">
        <label for="edit-${escapeHtml(field.key)}">${escapeHtml(field.label)}</label>
        ${control}
        <button type="button" class="editor-reset ${isDraft ? "" : "is-hidden"}" data-field-reset="${escapeHtml(field.key)}" aria-label="Reset ${escapeHtml(field.label)} to base" title="Reset to base">&#8634;</button>
      </div>
    `;
  });
  const designer = state.activeGroup === "Hair" ? lockDesignerMarkup(character)
    : state.activeGroup === "Beard" ? beardDesignerMarkup(character)
    : state.activeGroup === "Lighting" ? castShadowDesignerMarkup(character)
    : state.activeGroup === "Tattoo" ? tattooDesignerMarkup(character)
    : state.activeGroup === "Jewellery" ? jewelleryDesignerMarkup(character) : "";
  els.editorControls.innerHTML = nav + `<div class="editor-active-group">${rows.join("")}${designer}</div>`;
  if (state.activeGroup === "Hair") wireLockDesigner(character);
  if (state.activeGroup === "Beard") wireBeardDesigner(character);
  if (state.activeGroup === "Lighting") wireCastShadowDesigner(character);
  if (state.activeGroup === "Tattoo") wireTattooDesigner(character);
  if (state.activeGroup === "Jewellery") wireJewelleryDesigner(character);
  els.editorControls.querySelectorAll(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeGroup = tab.dataset.group;
      renderEditor(character);
      renderLockOverlay(character);
    });
  });
  els.editorControls.querySelectorAll("[data-kind='number']").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.value === "" || !Number.isFinite(Number(input.value))) return;
      updateCorrection(character, input.dataset.key, Number(input.value));
    });
  });
  els.editorControls.querySelectorAll("[data-step-field]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.stepField;
      const field = editorFields.find((item) => item.key === key);
      const input = els.editorControls.querySelector(`[data-key="${cssEscape(key)}"][data-kind="number"]`);
      if (!field || !input) return;
      const current = Number.isFinite(Number(input.value)) ? Number(input.value) : Number(baseValueFor(character, field));
      input.value = normalizeNumber(current + (Number(button.dataset.stepDirection) * Number(field.step || 1)));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
  els.editorControls.querySelectorAll("[data-kind='select']").forEach((select) => {
    select.addEventListener("change", () => {
      updateEnumCorrection(character, select.dataset.key, select.value);
    });
  });
  els.editorControls.querySelectorAll("[data-kind='color']").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.key;
      const hex = els.editorControls.querySelector(`[data-hexfor="${cssEscape(key)}"]`);
      if (hex) hex.value = input.value;
      updateColorCorrection(character, key, input.value);
    });
  });
  els.editorControls.querySelectorAll("[data-hexfor]").forEach((input) => {
    input.addEventListener("input", () => {
      const raw = input.value.trim();
      if (!/^#[0-9a-f]{6}$/i.test(raw)) return;
      const key = input.dataset.hexfor;
      const picker = els.editorControls.querySelector(`[data-key="${cssEscape(key)}"][data-kind="color"]`);
      if (picker) picker.value = raw;
      updateColorCorrection(character, key, raw);
    });
  });
  els.editorControls.querySelectorAll("[data-swatchfor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".studio-swatchpop")?.remove();
      const key = btn.dataset.swatchfor;
      const picker = els.editorControls.querySelector(`[data-key="${cssEscape(key)}"][data-kind="color"]`);
      const hex = els.editorControls.querySelector(`[data-hexfor="${cssEscape(key)}"]`);
      const current = toHex((hex && hex.value) || (picker && picker.value) || "#5a3d28");
      const hsl = rgbToHsl(...Object.values(hexToRgb(current)));
      const pop = document.createElement("div");
      pop.className = "studio-swatchpop";
      pop.innerHTML = `
        <div class="studio-pop-top">
          <span class="studio-pop-chip" style="--chip:${current}"></span>
          <input type="text" class="studio-pop-hex" value="${current}" maxlength="7" spellcheck="false" aria-label="Selected colour hex">
        </div>
        <label class="studio-pop-row"><span>H</span><input type="range" min="0" max="360" step="1" value="${hsl.h}" data-hsl="h"></label>
        <label class="studio-pop-row"><span>S</span><input type="range" min="0" max="100" step="1" value="${hsl.s}" data-hsl="s"></label>
        <label class="studio-pop-row"><span>L</span><input type="range" min="0" max="100" step="1" value="${hsl.l}" data-hsl="l"></label>
        <div class="studio-pop-swatches">${COLOR_SWATCHES.map((color) => `<button type="button" data-color="${color}" style="background:${color}" title="${color}"></button>`).join("")}</div>
      `;
      btn.after(pop);
      const chip = pop.querySelector(".studio-pop-chip");
      const hexField = pop.querySelector(".studio-pop-hex");
      const hInput = pop.querySelector('[data-hsl="h"]');
      const sInput = pop.querySelector('[data-hsl="s"]');
      const lInput = pop.querySelector('[data-hsl="l"]');
      const syncColor = (color) => {
        if (picker) picker.value = color;
        if (hex) hex.value = color;
        if (hexField) hexField.value = color;
        if (chip) chip.style.setProperty("--chip", color);
        const chipButton = els.editorControls.querySelector(`.studio-colorchip[data-swatchfor="${cssEscape(key)}"]`);
        if (chipButton) chipButton.style.setProperty("--chip", color);
        updateColorCorrection(character, key, color);
      };
      const syncFromHsl = () => {
        const rgb = hslToRgb(Number(hInput.value), Number(sInput.value), Number(lInput.value));
        syncColor(rgbToHex(rgb.r, rgb.g, rgb.b));
      };
      [hInput, sInput, lInput].forEach((input) => input.addEventListener("input", syncFromHsl));
      hexField.addEventListener("input", () => {
        const raw = hexField.value.trim();
        if (!/^#[0-9a-f]{6}$/i.test(raw)) return;
        const next = raw.toLowerCase();
        const nextHsl = rgbToHsl(...Object.values(hexToRgb(next)));
        hInput.value = nextHsl.h;
        sInput.value = nextHsl.s;
        lInput.value = nextHsl.l;
        syncColor(next);
      });
      pop.querySelectorAll("[data-color]").forEach((swatch) => swatch.addEventListener("click", () => {
        const color = swatch.dataset.color;
        const nextHsl = rgbToHsl(...Object.values(hexToRgb(color)));
        hInput.value = nextHsl.h;
        sInput.value = nextHsl.s;
        lInput.value = nextHsl.l;
        syncColor(color);
      }));
      setTimeout(() => document.addEventListener("pointerdown", function away(e) {
        if (!pop.contains(e.target) && e.target !== btn) {
          pop.remove();
          document.removeEventListener("pointerdown", away);
        }
      }), 0);
    });
  });
  els.editorControls.querySelectorAll("[data-kind='text']").forEach((input) => {
    input.addEventListener("input", () => updateColorCorrection(character, input.dataset.key, input.value));
  });
  els.editorControls.querySelectorAll("[data-field-reset]").forEach((btn) => {
    btn.addEventListener("click", () => clearFieldCorrection(character, btn.dataset.fieldReset));
  });
  renderCorrectionExport();
}

function wireInlineSwatchButtons(root) {
  root.querySelectorAll("[data-inline-swatchfor]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".studio-inline-swatchpop")?.remove();
      const target = root.querySelector(`#${cssEscape(btn.dataset.inlineSwatchfor)}`);
      if (!target) return;
      const pop = document.createElement("div");
      pop.className = "studio-swatchpop studio-inline-swatchpop";
      pop.innerHTML = `<div class="studio-pop-swatches">${COLOR_SWATCHES.map((color) => `<button type="button" data-color="${color}" style="background:${color}" title="${color}"></button>`).join("")}</div>`;
      btn.after(pop);
      pop.querySelectorAll("[data-color]").forEach((swatch) => swatch.addEventListener("click", () => {
        target.value = swatch.dataset.color;
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }));
      setTimeout(() => document.addEventListener("pointerdown", function away(e) {
        if (!pop.contains(e.target) && e.target !== btn) {
          pop.remove();
          document.removeEventListener("pointerdown", away);
        }
      }), 0);
    });
  });
}

// The auto (unset) colour shown in a colour picker. lipColor's auto derives from the skin tone.
function colorAutoFor(character, field) {
  if (field.key === "lipColor") {
    const skinName = correctionFor(character.id).skin || character.traits.skin;
    const hex = (traitBook.skinToneHex && traitBook.skinToneHex[skinName]) || "#c89070";
    return shadeHex(hex, 0.78);
  }
  if (field.key === "shirt") return character.traits.shirt || "#4a7bd9";
  if (field.key === "background") return character.traits.background || "#a9c4e0";
  if (field.key === "tattooColor") return character.traits.tattooColor || "#23232b";
  if (field.key === "accessoryColor") return character.traits.accessoryColor || character.traits.accent || "#171512";
  if (field.key === "eyelashColor") return character.traits.eyelashColor || "#1f2330";
  if (field.key === "eyeColor") return character.traits.eyeColor || "#5a3d28";
  if (field.key === "hairOutline") return hairOutlineHexFor(character);
  return "#000000";
}

function updateColorCorrection(character, key, value) {
  const next = { ...correctionFor(character.id) };
  if (!value) delete next[key];
  else next[key] = value;
  setCorrection(character.id, next);
  refreshPortrait(character);
}

function updateCorrection(character, key, value) {
  const field = editorFields.find((item) => item.key === key);
  if (!field) return;
  const base = baseValueFor(character, field);
  const normalized = normalizeNumber(value);
  const next = { ...correctionFor(character.id) };
  if (numbersEqual(normalized, base)) {
    delete next[key];
  } else {
    next[key] = normalized;
  }
  setCorrection(character.id, next);
  refreshPortrait(character);
}

function updateEnumCorrection(character, key, value) {
  const field = editorFields.find((item) => item.key === key);
  const fallback = character.traits[key] ?? field?.fallback;
  const next = { ...correctionFor(character.id) };
  if (value === fallback) {
    delete next[key];
  } else {
    next[key] = value;
  }
  setCorrection(character.id, next);
  render();
}

function clearFieldCorrection(character, key) {
  const next = { ...correctionFor(character.id) };
  delete next[key];
  setCorrection(character.id, next);
  render();
}

function clearSelectedCorrection() {
  if (!state.selectedId) return;
  delete state.corrections[state.selectedId];
  saveCorrections();
  render();
}

function clearAllCorrections() {
  const ok = window.confirm("Reset every face to the baked base set? This removes all local Face Studio changes.");
  if (!ok) return;
  state.corrections = {};
  saveCorrections();
  window.location.reload();
}

function baseValueFor(character, field) {
  const raw = character.traits[field.key] ?? field.fallback;
  return field.type === "select" ? raw : normalizeNumber(raw);
}

function renderHotspots() {
  if (!els.portraitHotspots) return;
  els.portraitHotspots.innerHTML = hotspots
    .map((spot, i) => `
      <button type="button" class="portrait-hotspot" data-group="${escapeHtml(spot.group)}"
        style="left:${spot.left}%; top:${spot.top}%; width:${spot.width}%; height:${spot.height}%;"
        title="${escapeHtml(spot.label)}" aria-label="${escapeHtml(spot.label)}"></button>
    `)
    .join("");
  els.portraitHotspots.querySelectorAll(".portrait-hotspot").forEach((button) => {
    button.addEventListener("click", () => jumpToGroup(button.dataset.group));
  });
}

function jumpToGroup(group) {
  if (!editorGroups.includes(group)) return;
  state.activeGroup = group;
  const character = characters.find((item) => item.id === state.selectedId) || characters[0];
  if (character) { renderEditor(character); renderLockOverlay(character); }
  els.editorControls.scrollIntoView({ behavior: "smooth", block: "nearest" });
  els.editorControls.querySelectorAll(".editor-control").forEach((control) => flash(control));
}

function flash(el) {
  el.classList.add("is-highlight");
  setTimeout(() => el.classList.remove("is-highlight"), 1200);
}

function cssEscape(value) {
  return String(value).replace(/["\\]/g, "\\$&");
}

function correctionFor(id) {
  return state.corrections[id] || {};
}

function readSelectedFaceId() {
  try {
    const stored = localStorage.getItem(selectedFaceStorageKey) || "";
    return characters.some((character) => character.id === stored)
      ? stored
      : (characters[0]?.id || "");
  } catch {
    return characters[0]?.id || "";
  }
}

function setSelectedFaceId(id) {
  state.selectedId = id;
  try {
    if (id) localStorage.setItem(selectedFaceStorageKey, id);
    else localStorage.removeItem(selectedFaceStorageKey);
  } catch {
    // Ignore storage issues and keep working in-memory.
  }
}

function setCorrection(id, correction) {
  const clean = Object.fromEntries(Object.entries(correction).filter(([, value]) => value !== "" && value !== null && value !== undefined));
  if (Object.keys(clean).length) {
    state.corrections[id] = clean;
  } else {
    delete state.corrections[id];
  }
  saveCorrections();
}

function readCorrections() {
  try {
    const parsed = JSON.parse(localStorage.getItem(correctionStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function cleanStoredCorrections(raw) {
  if (!raw || typeof raw !== "object") return {};
  let changed = false;
  const cleaned = {};
  Object.entries(raw).forEach(([id, correction]) => {
    if (!correction || typeof correction !== "object" || Array.isArray(correction)) {
      changed = true;
      return;
    }
    const character = characters.find((item) => item.id === id);
    if (!character) {
      cleaned[id] = correction;
      return;
    }
    const next = {};
    Object.entries(correction).forEach(([key, value]) => {
      if (draftValueMatchesBase(character, key, value)) {
        changed = true;
      } else {
        next[key] = value;
      }
    });
    if (Object.keys(next).length) cleaned[id] = next;
    else if (Object.keys(correction).length) changed = true;
  });
  if (changed || Object.keys(cleaned).length !== Object.keys(raw).length) {
    if (Object.keys(cleaned).length) localStorage.setItem(correctionStorageKey, JSON.stringify(cleaned));
    else localStorage.removeItem(correctionStorageKey);
  }
  return cleaned;
}

function draftValueMatchesBase(character, key, value) {
  const field = editorFields.find((item) => item.key === key);
  const rawBase = character.traits[key] ?? field?.fallback;
  if (rawBase === undefined) return false;
  if (field && !field.type) return numbersEqual(normalizeNumber(value), normalizeNumber(rawBase));
  return stableComparable(value) === stableComparable(rawBase);
}

function stableComparable(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.startsWith("#") ? value.toLowerCase() : value;
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) return `[${value.map(stableComparable).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${key}:${stableComparable(value[key])}`).join(",")}}`;
}

function saveCorrections() {
  if (Object.keys(state.corrections).length) localStorage.setItem(correctionStorageKey, JSON.stringify(state.corrections));
  else localStorage.removeItem(correctionStorageKey);
}

function setExportMode(mode) {
  state.exportMode = mode === "editedCharacters" ? "editedCharacters" : "corrections";
  renderCorrectionExport();
}

function baseCharacterId(id) {
  return String(id || "").replace(/^gen-/, "");
}

function editedCharactersExport() {
  const editedCharacters = {};
  characters.forEach((character) => {
    const correction = correctionFor(character.id);
    if (!Object.keys(correction).length) return;
    editedCharacters[baseCharacterId(character.id)] = {
      name: character.name,
      pronouns: character.pronouns,
      secret: character.secret,
      role: character.role,
      seed: character.seed,
      traits: JSON.parse(JSON.stringify({ ...character.traits, ...correction }))
    };
  });
  return { editedCharacters };
}

function currentExportPayload() {
  if (state.exportMode === "editedCharacters") {
    return editedCharactersExport();
  }
  const selected = state.selectedId ? { [state.selectedId]: correctionFor(state.selectedId) } : {};
  return {
    selected,
    all: state.corrections
  };
}

function combinedEditorPastePayload() {
  return {
    all: Object.fromEntries(
      characters.map((character) => [character.id, correctionFor(character.id)])
    )
  };
}

function renderCorrectionExport() {
  const payload = currentExportPayload();
  els.correctionExport.value = JSON.stringify(payload, null, 2);
  if (els.combinedCorrectionExport) {
    els.combinedCorrectionExport.value = JSON.stringify(combinedEditorPastePayload(), null, 2);
  }
  if (els.exportModeLabel) {
    els.exportModeLabel.textContent = state.exportMode === "editedCharacters"
      ? "Bake Export"
      : "Draft Export";
  }
  if (els.combinedExportLabel) {
    els.combinedExportLabel.textContent = `Combined Editor Paste (${characters.length})`;
  }
  els.exportModeCorrections?.classList.toggle("is-active", state.exportMode === "corrections");
  els.exportModeEdited?.classList.toggle("is-active", state.exportMode === "editedCharacters");
}

async function copyTextareaValue(textarea, button) {
  const text = textarea?.value || "";
  if (!text || !button) return;
  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    copied = false;
  }
  if (!copied && textarea) {
    textarea.focus();
    textarea.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.setSelectionRange(0, 0);
    textarea.blur();
  }
  button.textContent = copied ? "Copied" : "Copy failed";
  window.setTimeout(() => {
    if (document.contains(button)) button.textContent = "Copy";
  }, 1200);
}

async function copyCurrentExport() {
  await copyTextareaValue(els.correctionExport, els.copyExportButton);
}

async function copyCombinedExport() {
  await copyTextareaValue(els.combinedCorrectionExport, els.copyCombinedExportButton);
}

function tattooDefaults(character) {
  const t = { ...character.traits, ...correctionFor(character.id) };
  if (window.WhoEditorShared && window.WhoEditorShared.normalizeTattooList) {
    return window.WhoEditorShared.normalizeTattooList(t);
  }
  if (Array.isArray(t.tattoos) && t.tattoos.length) return t.tattoos.map((item) => ({ ...item }));
  return [];
}

function jewelleryDefaults(character) {
  const t = { ...character.traits, ...correctionFor(character.id) };
  if (window.WhoEditorShared && window.WhoEditorShared.normalizeJewelleryList) {
    return window.WhoEditorShared.normalizeJewelleryList(t);
  }
  if (Array.isArray(t.jewelleryItems) && t.jewelleryItems.length) return t.jewelleryItems.map((item) => ({ ...item }));
  return [];
}

function castShadowDefaults(character) {
  const t = { ...character.traits, ...correctionFor(character.id) };
  if (window.WhoEditorShared && window.WhoEditorShared.normalizeCastShadowList) {
    return window.WhoEditorShared.normalizeCastShadowList(t);
  }
  if (Array.isArray(t.castShadowItems) && t.castShadowItems.length) return t.castShadowItems.map((item) => ({ ...item }));
  return [];
}

function setJewelleryList(character, items) {
  const keep = items.filter((item) => item.type && item.type !== "none");
  const next = { ...correctionFor(character.id) };
  delete next.jewellery;
  delete next.jewellerySide;
  delete next.jewelleryColor;
  delete next.jewelleryColor2;
  delete next.jewelleryMetal;
  delete next.jewelleryX;
  delete next.jewelleryY;
  delete next.jewelleryScale;
  delete next.jewelleryRot;
  delete next.jewelleryLayer;
  delete next.jewelleryArcStart;
  delete next.jewelleryArcVisible;
  if (keep.length) next.jewelleryItems = keep;
  else delete next.jewelleryItems;
  setCorrection(character.id, next);
  refreshPortrait(character);
  renderCorrectionExport();
}

function setCastShadowList(character, items) {
  const keep = items.filter((item) => item.preset && item.preset !== "off" && Number(item.opacity) > 0);
  const next = { ...correctionFor(character.id) };
  delete next.castShadowPreset;
  delete next.castShadowOpacity;
  delete next.castShadowAngle;
  delete next.castShadowSoftness;
  delete next.castShadowX;
  delete next.castShadowY;
  if (keep.length) next.castShadowItems = keep;
  else delete next.castShadowItems;
  setCorrection(character.id, next);
  refreshPortrait(character);
  renderCorrectionExport();
}

function castShadowDesignerMarkup(character) {
  const items = castShadowDefaults(character);
  const presetOptions = (traitBook.castShadowPresets || ["hairline", "sweptLeft", "sweptRight", "capBrim", "sideLeft", "sideRight", "beardJaw"]).filter((value) => value !== "off");
  const surfaceOptions = [["face", "Face"], ["neck", "Neck"], ["body", "Body / Clothes"], ["both", "Face + Neck"], ["all", "Face + Neck + Body"]];
  const sideOptions = [["one", "One Side"], ["both", "Both Sides"]];
  const tintOptions = [["neutral", "Neutral"], ["warm", "Warm"], ["cool", "Cool"], ["hairLinked", "Hair-Linked"]];
  const optionList = (options, selected) => options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const num = (idx, key, label, min, max, step, fallback) => {
    const value = items[idx]?.[key] ?? fallback;
    return `<label class="lock-num">${escapeHtml(label)}
      <span class="lock-num-pair">
        <input type="range" min="${min}" max="${max}" step="${step}" value="${escapeHtml(value)}" data-shadow-num="${idx}:${key}" data-pair="s:${idx}:${key}">
        <input type="number" step="${step}" value="${escapeHtml(value)}" data-shadow-num="${idx}:${key}" data-pair="s:${idx}:${key}" aria-label="${escapeHtml(label)} value">
      </span>
      <span class="editor-value">${formatNumber(value)}</span>
    </label>`;
  };
  const rows = items.map((item, idx) => `
    <div class="lock-instance tattoo-instance" data-shadow-index="${idx}">
      <div class="lock-head">
        <strong>Shadow ${idx + 1}</strong>
        <span>
          <button type="button" class="mini-button" data-shadow-up="${idx}" ${idx === 0 ? "disabled" : ""}>Up</button>
          <button type="button" class="mini-button" data-shadow-down="${idx}" ${idx === items.length - 1 ? "disabled" : ""}>Down</button>
          <button type="button" class="mini-button" data-shadow-remove="${idx}">Remove</button>
        </span>
      </div>
      <label class="editor-control-inline"><span>Preset</span><select data-shadow-select="${idx}:preset">${presetOptions.map((value) => `<option value="${escapeHtml(value)}" ${value === item.preset ? "selected" : ""}>${escapeHtml(titleCase(value))}</option>`).join("")}</select></label>
      <label class="editor-control-inline"><span>Surface</span><select data-shadow-select="${idx}:surface">${optionList(surfaceOptions, item.surface || "face")}</select></label>
      <label class="editor-control-inline"><span>Sides</span><select data-shadow-select="${idx}:sides">${optionList(sideOptions, item.sides || "one")}</select></label>
      <label class="editor-control-inline"><span>Tint</span><select data-shadow-select="${idx}:tint">${optionList(tintOptions, item.tint || "neutral")}</select></label>
      ${num(idx, "x", "X", -120, 120, 1, 0)}
      ${num(idx, "y", "Y", -120, 120, 1, 0)}
      ${num(idx, "spread", "Spread", 0, 80, 1, 0)}
      ${num(idx, "darkness", "Darkness", -1.5, 3, 0.05, 0)}
      ${num(idx, "scaleX", "Width", 0.4, 2.6, 0.02, 1)}
      ${num(idx, "scaleY", "Height", 0.4, 2.6, 0.02, 1)}
      ${num(idx, "rot", "Rotate", -180, 180, 1, 0)}
      ${num(idx, "opacity", "Opacity", 0.05, 1, 0.05, 0.35)}
      ${num(idx, "softness", "Softness", 0.6, 2.2, 0.05, 1)}
    </div>
  `).join("");
  return `
    <div class="lock-designer tattoo-designer">
      <div class="lock-toolbar">
        <button type="button" class="mini-button" data-shadow-add>Add shadow</button>
        ${items.length ? `<button type="button" class="mini-button" data-shadow-clear>Clear shadows</button>` : ""}
      </div>
      ${rows || `<p class="editor-empty">No cast shadows yet.</p>`}
    </div>`;
}

function wireCastShadowDesigner(character) {
  const root = els.editorControls.querySelector(".tattoo-designer");
  if (!root) return;
  const withList = (fn) => {
    const items = castShadowDefaults(character);
    fn(items);
    setCastShadowList(character, items);
    renderEditor(character);
  };
  root.querySelector("[data-shadow-add]")?.addEventListener("click", () => withList((items) => {
    items.push({ preset: "capBrim", surface: "face", sides: "one", x: 0, y: 0, spread: 0, darkness: 0, tint: "neutral", scaleX: 1, scaleY: 1, rot: 0, opacity: 0.35, softness: 1 });
  }));
  root.querySelector("[data-shadow-clear]")?.addEventListener("click", () => withList((items) => items.splice(0)));
  root.querySelectorAll("[data-shadow-remove]").forEach((btn) => btn.addEventListener("click", () => withList((items) => items.splice(Number(btn.dataset.shadowRemove), 1))));
  root.querySelectorAll("[data-shadow-up]").forEach((btn) => btn.addEventListener("click", () => withList((items) => {
    const i = Number(btn.dataset.shadowUp);
    if (i > 0) [items[i - 1], items[i]] = [items[i], items[i - 1]];
  })));
  root.querySelectorAll("[data-shadow-down]").forEach((btn) => btn.addEventListener("click", () => withList((items) => {
    const i = Number(btn.dataset.shadowDown);
    if (i < items.length - 1) [items[i + 1], items[i]] = [items[i], items[i + 1]];
  })));
  root.querySelectorAll("[data-shadow-select]").forEach((select) => select.addEventListener("change", () => {
    const [idx, key] = select.dataset.shadowSelect.split(":");
    const items = castShadowDefaults(character);
    const item = items[Number(idx)];
    if (!item) return;
    item[key] = select.value;
    setCastShadowList(character, items);
  }));
  root.querySelectorAll("[data-shadow-num]").forEach((input) => input.addEventListener("input", () => {
    const [idx, key] = input.dataset.shadowNum.split(":");
    const items = castShadowDefaults(character);
    const item = items[Number(idx)];
    if (!item) return;
    item[key] = Number(input.value);
    if (input.dataset.pair) {
      root.querySelectorAll(`[data-pair="${cssEscape(input.dataset.pair)}"]`).forEach((peer) => {
        if (peer === input) return;
        if (peer.type === "range") {
          const min = Number(peer.min);
          const max = Number(peer.max);
          const val = Number(input.value);
          if (Number.isFinite(val) && val >= min && val <= max) peer.value = input.value;
        } else {
          peer.value = input.value;
        }
      });
    }
    const wrap = input.closest(".lock-num");
    const valueLabel = wrap && wrap.querySelector(".editor-value");
    if (valueLabel) valueLabel.textContent = formatNumber(input.value);
    setCastShadowList(character, items);
  }));
}

function jewelleryDesignerMarkup(character) {
  const items = jewelleryDefaults(character);
  const typeOptions = traitBook.jewellery || ["none"];
  const sideOptions = [["both", "Both"], ["left", "Left"], ["right", "Right"]];
  const layerOptions = [["beforeHead", "Behind Head"], ["behindHair", "Behind Hair"], ["beforeMouth", "Before Mouth"], ["afterMouth", "Front"]];
  const metalOptions = [["", "Auto"], ["silver", "Silver"], ["gold", "Gold"], ["black", "Black"], ["roseGold", "Rose Gold"]];
  const optionList = (options, selected) => options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  const num = (idx, key, label, min, max, step, fallback) => {
    const value = items[idx]?.[key] ?? fallback;
    return `<label class="lock-num">${escapeHtml(label)}
      <span class="lock-num-pair">
        <input type="range" min="${min}" max="${max}" step="${step}" value="${escapeHtml(value)}" data-jewel-num="${idx}:${key}" data-pair="j:${idx}:${key}">
        <input type="number" step="${step}" value="${escapeHtml(value)}" data-jewel-num="${idx}:${key}" data-pair="j:${idx}:${key}" aria-label="${escapeHtml(label)} value">
      </span>
      <span class="editor-value">${formatNumber(value)}</span>
    </label>`;
  };
  const rows = items.map((item, idx) => `
    <div class="lock-instance tattoo-instance" data-jewellery-index="${idx}">
      <div class="lock-head">
        <strong>Jewellery ${idx + 1}</strong>
        <span>
          <button type="button" class="mini-button" data-jewellery-up="${idx}" ${idx === 0 ? "disabled" : ""}>Up</button>
          <button type="button" class="mini-button" data-jewellery-down="${idx}" ${idx === items.length - 1 ? "disabled" : ""}>Down</button>
          <button type="button" class="mini-button" data-jewellery-remove="${idx}">Remove</button>
        </span>
      </div>
      <label class="editor-control-inline"><span>Type</span><select data-jewellery-select="${idx}:type">${typeOptions.map((value) => `<option value="${escapeHtml(value)}" ${value === item.type ? "selected" : ""}>${escapeHtml(titleCase(value))}</option>`).join("")}</select></label>
      <label class="editor-control-inline"><span>Side</span><select data-jewellery-select="${idx}:side">${optionList(sideOptions, item.side || "both")}</select></label>
      <label class="editor-control-inline"><span>Layer</span><select data-jewellery-select="${idx}:layer">${optionList(layerOptions, item.layer || "behindHair")}</select></label>
      <label class="editor-control-inline"><span>Metal</span><select data-jewellery-select="${idx}:metal">${optionList(metalOptions, item.metal || "")}</select></label>
      <label class="editor-control-inline"><span>Colour</span><span class="mini-colorrow"><input id="jewel-color-${idx}" type="color" value="${escapeHtml(item.color || "#e2b84f")}" data-jewellery-color="${idx}:color">${miniSwatchButton(`jewel-color-${idx}`)}</span></label>
      <label class="editor-control-inline"><span>Second Colour</span><span class="mini-colorrow"><input id="jewel-color2-${idx}" type="color" value="${escapeHtml(item.color2 || "#ff9bb0")}" data-jewellery-color="${idx}:color2">${miniSwatchButton(`jewel-color2-${idx}`)}</span></label>
      ${num(idx, "x", "X", -120, 120, 1, 0)}
      ${num(idx, "y", "Y", -120, 120, 1, 0)}
      ${num(idx, "scale", "Size", 0.25, 2.4, 0.02, 1)}
      ${num(idx, "rot", "Rotate", -180, 180, 1, 0)}
      ${num(idx, "arcStart", "Arc Start", -180, 180, 1, 0)}
      ${num(idx, "arcVisible", "Arc Visible", 0.08, 1, 0.02, 1)}
    </div>
  `).join("");
  return `
    <div class="lock-designer tattoo-designer">
      <div class="lock-toolbar">
        <button type="button" class="mini-button" data-jewellery-add>Add jewellery</button>
        ${items.length ? `<button type="button" class="mini-button" data-jewellery-clear>Clear jewellery</button>` : ""}
      </div>
      ${rows || `<p class="editor-empty">No jewellery items yet.</p>`}
    </div>`;
}

function wireJewelleryDesigner(character) {
  const root = els.editorControls.querySelector(".tattoo-designer");
  if (!root) return;
  wireInlineSwatchButtons(root);
  const withList = (fn) => {
    const items = jewelleryDefaults(character);
    fn(items);
    setJewelleryList(character, items);
    renderEditor(character);
  };
  root.querySelector("[data-jewellery-add]")?.addEventListener("click", () => withList((items) => {
    items.push({ type: "studs", side: "both", color: "#e2b84f", color2: "#ff9bb0", metal: "", x: 0, y: 0, scale: 1, rot: 0, layer: "behindHair", arcStart: 0, arcVisible: 1 });
  }));
  root.querySelector("[data-jewellery-clear]")?.addEventListener("click", () => withList((items) => items.splice(0)));
  root.querySelectorAll("[data-jewellery-remove]").forEach((btn) => btn.addEventListener("click", () => withList((items) => items.splice(Number(btn.dataset.jewelleryRemove), 1))));
  root.querySelectorAll("[data-jewellery-up]").forEach((btn) => btn.addEventListener("click", () => withList((items) => {
    const i = Number(btn.dataset.jewelleryUp);
    if (i > 0) [items[i - 1], items[i]] = [items[i], items[i - 1]];
  })));
  root.querySelectorAll("[data-jewellery-down]").forEach((btn) => btn.addEventListener("click", () => withList((items) => {
    const i = Number(btn.dataset.jewelleryDown);
    if (i < items.length - 1) [items[i + 1], items[i]] = [items[i], items[i + 1]];
  })));
  root.querySelectorAll("[data-jewellery-select]").forEach((select) => select.addEventListener("change", () => {
    const [idx, key] = select.dataset.jewellerySelect.split(":");
    const items = jewelleryDefaults(character);
    const item = items[Number(idx)];
    if (!item) return;
    item[key] = select.value;
    setJewelleryList(character, items);
  }));
  root.querySelectorAll("[data-jewellery-color]").forEach((input) => input.addEventListener("input", () => {
    const [idx, key] = input.dataset.jewelleryColor.split(":");
    const items = jewelleryDefaults(character);
    const item = items[Number(idx)];
    if (!item) return;
    item[key] = input.value;
    setJewelleryList(character, items);
  }));
  root.querySelectorAll("[data-jewel-num]").forEach((input) => input.addEventListener("input", () => {
    const [idx, key] = input.dataset.jewelNum.split(":");
    const items = jewelleryDefaults(character);
    const item = items[Number(idx)];
    if (!item) return;
    item[key] = Number(input.value);
    if (input.dataset.pair) {
      root.querySelectorAll(`[data-pair="${cssEscape(input.dataset.pair)}"]`).forEach((peer) => {
        if (peer === input) return;
        if (peer.type === "range") {
          const min = Number(peer.min);
          const max = Number(peer.max);
          const val = Number(input.value);
          if (Number.isFinite(val) && val >= min && val <= max) peer.value = input.value;
        } else {
          peer.value = input.value;
        }
      });
    }
    const wrap = input.closest(".lock-num");
    const valueLabel = wrap && wrap.querySelector(".editor-value");
    if (valueLabel) valueLabel.textContent = formatNumber(input.value);
    setJewelleryList(character, items);
  }));
}

function setTattooList(character, tattoos) {
  const next = { ...correctionFor(character.id), tattoos: tattoos.filter((tattoo) => tattoo.text || tattoo.place || tattoo.color) };
  setCorrection(character.id, next);
  refreshPortrait(character);
  renderCorrectionExport();
}

function tattooDesignerMarkup(character) {
  const tattoos = tattooDefaults(character);
  const placeOptions = (traitBook.tattooPlaces || ["body", "face"]).map((value) => `<option value="${escapeHtml(value)}">{label}</option>`);
  const layerOptions = ["overClothes", "onSkin"].map((value) => `<option value="${escapeHtml(value)}">{label}</option>`);
  const fontOptions = (traitBook.tattooFonts || ["bold"]).map((value) => `<option value="${escapeHtml(value)}">{label}</option>`);
  const optionList = (options, selected) => options.map((tpl) => {
    const value = /value="([^"]*)"/.exec(tpl)?.[1] || "";
    return tpl
      .replace("{label}", escapeHtml(titleCase(value)))
      .replace(">", `${value === selected ? " selected" : ""}>`);
  }).join("");
  const number = (idx, key, label, min, max, step, fallback) => {
    const value = tattoos[idx]?.[key] ?? fallback;
    return `<label class="lock-num">${escapeHtml(label)}
      <span class="lock-num-pair">
        <input type="range" min="${min}" max="${max}" step="${step}" value="${escapeHtml(value)}" data-tattoo-num="${idx}:${key}" data-pair="${idx}:${key}">
        <input type="number" step="${step}" value="${escapeHtml(value)}" data-tattoo-num="${idx}:${key}" data-pair="${idx}:${key}" aria-label="${escapeHtml(label)} value">
      </span>
      <span class="editor-value">${formatNumber(value)}</span>
    </label>`;
  };
  const rows = tattoos.map((tattoo, idx) => `
    <div class="lock-instance tattoo-instance" data-tattoo-index="${idx}">
      <div class="lock-head">
        <strong>Tattoo ${idx + 1}</strong>
        <span>
          <button type="button" class="mini-button" data-tattoo-up="${idx}" ${idx === 0 ? "disabled" : ""}>Up</button>
          <button type="button" class="mini-button" data-tattoo-down="${idx}" ${idx === tattoos.length - 1 ? "disabled" : ""}>Down</button>
          <button type="button" class="mini-button" data-tattoo-remove="${idx}">Remove</button>
        </span>
      </div>
      <label class="editor-control-inline"><span>Text</span><input type="text" value="${escapeHtml(tattoo.text || "")}" data-tattoo-text="${idx}" maxlength="18" spellcheck="false"></label>
      <label class="editor-control-inline"><span>Place</span><select data-tattoo-select="${idx}:place">${optionList(placeOptions, tattoo.place || "body")}</select></label>
      <label class="editor-control-inline"><span>Layer</span><select data-tattoo-select="${idx}:layer">${optionList(layerOptions, tattoo.layer || "overClothes")}</select></label>
      <label class="editor-control-inline"><span>Font</span><select data-tattoo-select="${idx}:font">${optionList(fontOptions, tattoo.font || "bold")}</select></label>
      <label class="editor-control-inline"><span>Colour</span><span class="mini-colorrow"><input id="tattoo-color-${idx}" type="color" value="${escapeHtml(tattoo.color || "#23232b")}" data-tattoo-color="${idx}">${miniSwatchButton(`tattoo-color-${idx}`)}</span></label>
      ${number(idx, "x", "X", -80, 80, 1, 0)}
      ${number(idx, "y", "Y", -60, 50, 1, 0)}
      ${number(idx, "scale", "Size", 0.25, 3.5, 0.05, 1)}
      ${number(idx, "rot", "Rotate", -90, 90, 1, 0)}
      ${number(idx, "skewX", "Skew", -45, 45, 1, 0)}
      ${number(idx, "warp", "Warp", 0, 1, 0.02, 0)}
      ${number(idx, "opacity", "Fade", 0, 1, 0.05, 1)}
    </div>
  `).join("");
  return `
    <div class="lock-designer tattoo-designer">
      <div class="lock-toolbar">
        <button type="button" class="mini-button" data-tattoo-add>Add tattoo</button>
        ${tattoos.length ? `<button type="button" class="mini-button" data-tattoo-clear>Clear tattoos</button>` : ""}
      </div>
      ${rows || `<p class="editor-empty">No tattoos in the tattoo list yet.</p>`}
    </div>`;
}

function wireTattooDesigner(character) {
  const root = els.editorControls.querySelector(".tattoo-designer");
  if (!root) return;
  wireInlineSwatchButtons(root);
  const withList = (fn) => {
    const tattoos = tattooDefaults(character);
    fn(tattoos);
    setTattooList(character, tattoos);
    renderEditor(character);
  };
  root.querySelector("[data-tattoo-add]")?.addEventListener("click", () => withList((tattoos) => {
    tattoos.push({ text: "ink", place: "body", layer: "overClothes", font: "bold", color: "#23232b", x: 0, y: 0, scale: 1, rot: 0, skewX: 0, warp: 0, opacity: 1 });
  }));
  root.querySelector("[data-tattoo-clear]")?.addEventListener("click", () => withList((tattoos) => tattoos.splice(0)));
  root.querySelectorAll("[data-tattoo-remove]").forEach((btn) => btn.addEventListener("click", () => withList((tattoos) => tattoos.splice(Number(btn.dataset.tattooRemove), 1))));
  root.querySelectorAll("[data-tattoo-up]").forEach((btn) => btn.addEventListener("click", () => withList((tattoos) => {
    const i = Number(btn.dataset.tattooUp);
    if (i > 0) [tattoos[i - 1], tattoos[i]] = [tattoos[i], tattoos[i - 1]];
  })));
  root.querySelectorAll("[data-tattoo-down]").forEach((btn) => btn.addEventListener("click", () => withList((tattoos) => {
    const i = Number(btn.dataset.tattooDown);
    if (i < tattoos.length - 1) [tattoos[i + 1], tattoos[i]] = [tattoos[i], tattoos[i + 1]];
  })));
  root.querySelectorAll("[data-tattoo-text]").forEach((input) => input.addEventListener("input", () => {
    const tattoos = tattooDefaults(character);
    const tattoo = tattoos[Number(input.dataset.tattooText)];
    if (!tattoo) return;
    tattoo.text = input.value;
    setTattooList(character, tattoos);
  }));
  root.querySelectorAll("[data-tattoo-select]").forEach((select) => select.addEventListener("change", () => {
    const [idx, key] = select.dataset.tattooSelect.split(":");
    const tattoos = tattooDefaults(character);
    const tattoo = tattoos[Number(idx)];
    if (!tattoo) return;
    tattoo[key] = select.value;
    setTattooList(character, tattoos);
  }));
  root.querySelectorAll("[data-tattoo-color]").forEach((input) => input.addEventListener("input", () => {
    const tattoos = tattooDefaults(character);
    const tattoo = tattoos[Number(input.dataset.tattooColor)];
    if (!tattoo) return;
    tattoo.color = input.value;
    setTattooList(character, tattoos);
  }));
  root.querySelectorAll("[data-tattoo-num]").forEach((input) => input.addEventListener("input", () => {
    const [idx, key] = input.dataset.tattooNum.split(":");
    const tattoos = tattooDefaults(character);
    const tattoo = tattoos[Number(idx)];
    if (!tattoo) return;
    tattoo[key] = Number(input.value);
    if (input.dataset.pair) {
      root.querySelectorAll(`[data-pair="${cssEscape(input.dataset.pair)}"]`).forEach((peer) => {
        if (peer === input) return;
        if (peer.type === "range") {
          const min = Number(peer.min);
          const max = Number(peer.max);
          const val = Number(input.value);
          if (Number.isFinite(val) && val >= min && val <= max) peer.value = input.value;
        } else {
          peer.value = input.value;
        }
      });
    }
    const span = input.parentElement.querySelector(".editor-value");
    const wrap = input.closest(".lock-num");
    const valueLabel = wrap && wrap.querySelector(".editor-value");
    if (valueLabel) valueLabel.textContent = formatNumber(input.value);
    setTattooList(character, tattoos);
  }));
}

function normalizeNumber(value) {
  return Number(Number(value).toFixed(3));
}

function numbersEqual(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.001;
}

function formatNumber(value) {
  return Number.isInteger(Number(value)) ? String(value) : Number(value).toFixed(2);
}

/* ===================== Hair Lock Designer ===================== *
 * Locks are stored per character as corrections[id].hairLocks - an ordered array (array order =
 * z-order, last = front). Each entry: { lock, x, y, scale, rot, lines, outline?, internalLine?,
 * internalLineWidth?, internalLineColor?, fill?, dark?, shine?, line? }
 * with x/y as 0-100 (% of the 256 portrait box) for the lock's centre. The generator reads this
 * trait and composites the locks on top of the hair, so edits persist + show in the export JSON. */
const LOCK_CATALOG = (window.facesHair && window.facesHair.lockCatalog) || [];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function currentCharacter() { return characters.find((c) => c.id === state.selectedId) || characters[0]; }
function lockLabel(key) { return (LOCK_CATALOG.find((c) => c.key === key) || {}).label || titleCase(key); }

function shadeHex(hex, factor) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  if (Number.isNaN(n)) return "#6b4a2f";
  const ch = (shift) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
  const hp = (v) => v.toString(16).padStart(2, "0");
  return `#${hp(ch(16))}${hp(ch(8))}${hp(ch(0))}`;
}

function hasPaint(value) {
  return !!value && value !== "none" && value !== "transparent" && value !== "rgba(0,0,0,0)";
}

function namedHairHexFor(character) {
  const name = correctionFor(character.id).hairColor || character.traits.hairColor;
  return (traitBook.hairColorHex && traitBook.hairColorHex[name]) || "#6b4a2f";
}

function hairHexFor(character) {
  return correctionFor(character.id).hairHex || character.traits.hairHex || namedHairHexFor(character);
}

function hairOutlineHexFor(character) {
  const traits = { ...character.traits, ...correctionFor(character.id) };
  if (hasPaint(traits.hairOutline)) return traits.hairOutline;
  return shadeHex(hairHexFor(character), 0.52);
}

function normalizeLockInstance(inst) {
  if (!inst || typeof inst !== "object") return inst;
  const next = { ...inst };
  if (next.internalLine == null && next.outlineForce) next.internalLine = true;
  delete next.outlineForce;
  return next;
}

// Read-only effective locks: a hairLocks correction wins, otherwise fall back to the character's
// baked-in base locks (so a baked character like Aaron shows its locks in the designer).
function getLocks(id) {
  const corr = correctionFor(id).hairLocks;
  if (Array.isArray(corr)) return corr.map(normalizeLockInstance);
  const ch = characters.find((c) => c.id === id);
  const base = ch && ch.traits && ch.traits.hairLocks;
  return Array.isArray(base) ? base.map(normalizeLockInstance) : [];
}

// For in-place mutation: ensure there's a hairLocks correction (deep-copied from the base on first
// touch) so editing a baked character never mutates the shared base array.
function editableLocks(id) {
  if (!Array.isArray(correctionFor(id).hairLocks)) {
    setLocks(id, getLocks(id));
  } else if (correctionFor(id).hairLocks.some((inst) => inst && inst.outlineForce && inst.internalLine == null)) {
    setLocks(id, correctionFor(id).hairLocks);
  }
  return correctionFor(id).hairLocks;
}

function setLocks(id, arr) {
  const next = { ...correctionFor(id) };
  const normalized = Array.isArray(arr) ? arr.map(normalizeLockInstance) : [];
  if (normalized.length) next.hairLocks = normalized;
  else delete next.hairLocks;
  setCorrection(id, next);
}

function lockThumb(key) {
  if (!window.facesHair || !window.facesHair.renderLock) return "";
  const g = window.facesHair.renderLock({ lock: key, x: 50, y: 50, scale: 1.02, rot: 0, lines: true }, { hair: "#6b4a2f", ink: "#1f2330" });
  return `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}

function lockDesignerMarkup(character) {
  const locks = getLocks(character.id);
  const hairHex = hairHexFor(character);
  const outlineHex = hairOutlineHexFor(character);
  const merged = (traitsFor(character, selectedExpressionFor(character)).lockBlend || "merged") === "merged";
  const palette = LOCK_CATALOG
    .map(({ key, label }) => `
      <button type="button" class="lock-chip" draggable="true" data-lock="${escapeHtml(key)}" title="Add ${escapeHtml(label)}">
        <span class="lock-chip-art">${lockThumb(key)}</span>
        <span class="lock-chip-label">${escapeHtml(label)}</span>
      </button>`)
    .join("");
  const stack = locks.length
    ? locks.map((inst, i) => lockRowMarkup(character, inst, i, locks.length, hairHex, outlineHex, merged)).join("")
    : `<p class="lock-empty">No locks yet — click a style above, or drag one onto the hair.</p>`;
  return `
    <div class="lock-designer">
      <div class="lock-designer-head">
        <p class="meta-label">Lock Designer</p>
        ${locks.length ? `<button type="button" class="mini-button" data-lock-clear>Clear locks</button>` : ""}
      </div>
      ${hairDyePanelMarkup(character)}
      <div class="lock-palette">${palette}</div>
      <div class="lock-stack">${stack}</div>
      ${merged ? mergedHairPanelMarkup(character) : ""}
    </div>
    ${penDesignerMarkup()}`;
}

function hairDyePanelMarkup(character) {
  const dyed = !!correctionFor(character.id).hairHex;
  const value = hairHexFor(character);
  return `
    <div class="lock-row lock-dye-panel">
      <div class="lock-row-head">
        <span class="lock-drawn-tag">Dye Hair</span>
        <button type="button" class="mini-button" data-hair-dye-clear ${dyed ? "" : "disabled"}>Reset dye</button>
      </div>
      <div class="lock-row-colors lock-dye-colors">
        <label class="lock-color ${dyed ? "is-set" : ""}">
          <span class="mini-colorrow"><input id="hair-dye-color" type="color" value="${escapeHtml(value)}" data-hair-dye-color>${miniSwatchButton("hair-dye-color")}</span>
          <span>Dye</span>
        </label>
      </div>
    </div>`;
}

function mergedHairPanelMarkup(character) {
  const controls = MERGED_INTERNAL_LINE_FIELDS
    .map((field) => mergedHairFieldMarkup(character, field))
    .join("");
  return `
    <div class="lock-row lock-merged-panel">
      <div class="lock-row-head">
        <span class="lock-drawn-tag">Advanced Merged Hair</span>
      </div>
      <div class="lock-merged-grid">${controls}</div>
    </div>`;
}

function mergedHairFieldMarkup(character, field) {
  const value = mergedInternalLineValueFor(character, field.key);
  const pair = `ml:${field.key}`;
  return `
    <label class="lock-num">
      ${escapeHtml(field.label)}
      <span class="lock-num-pair">
        <input type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${escapeHtml(value)}" data-merged-line-num="${field.key}" data-pair="${pair}">
        <input type="number" step="${field.step}" value="${escapeHtml(value)}" data-merged-line-num="${field.key}" data-pair="${pair}" aria-label="${escapeHtml(field.label)} value">
      </span>
      <span class="editor-value">${formatNumber(value)}</span>
    </label>`;
}

// Pen-tool panel: toggle drawing mode, set the drawn-hair style, and re-apply saved custom shapes.
function penDesignerMarkup() {
  const p = state.pen;
  const saved = readPenLocks();
  const savedRow = saved.length
    ? saved.map((s, i) => `
        <span class="pen-saved-chip">
          <button type="button" class="mini-button" data-pen-apply="${i}" title="Add to this character">${escapeHtml(s.name)}</button>
          <button type="button" class="pen-saved-del" data-pen-del="${i}" title="Delete saved shape">×</button>
        </span>`).join("")
    : `<span class="lock-empty">No saved shapes yet.</span>`;
  return `
    <div class="lock-designer pen-designer">
      <div class="lock-designer-head">
        <p class="meta-label">Pen Tool — Draw Hair</p>
        <button type="button" class="mini-button ${p.mode ? "is-active" : ""}" data-pen-toggle>${p.mode ? "Drawing…" : "✏️ Draw"}</button>
      </div>
      ${p.mode ? `
        <p class="pen-hint">Click to drop points · drag a point to curve it · click the first point (or Finish) to close.</p>
        <div class="pen-controls">
          <label class="pen-opt"><span>Colour</span><span class="mini-colorrow"><input id="pen-color" type="color" data-pen-color value="${p.color || "#3a2418"}">${miniSwatchButton("pen-color")}</span></label>
          <label class="pen-opt"><input type="checkbox" data-pen-outline ${p.outline ? "checked" : ""}> Outline</label>
          <label class="pen-opt"><input type="checkbox" data-pen-lines ${p.lines ? "checked" : ""}> Strand lines</label>
        </div>
        <div class="pen-actions">
          <button type="button" class="mini-button" data-pen-finish>Finish &amp; apply</button>
          <button type="button" class="mini-button" data-pen-undo>Undo point</button>
          <button type="button" class="mini-button" data-pen-cancel>Cancel</button>
          <button type="button" class="mini-button" data-pen-save>Save as shape…</button>
        </div>` : ""}
      <div class="pen-saved">${savedRow}</div>
    </div>`;
}

const DEFAULT_INTERNAL_LINE_WIDTH = 5.5;
const MAX_INTERNAL_LINE_WIDTH = 20;
const MERGED_INTERNAL_LINE_FIELDS = [
  { key: "mergedInternalLineWidth", label: "Width", min: 0.6, max: MAX_INTERNAL_LINE_WIDTH, step: 0.05, fallback: 2.35 },
  { key: "mergedInternalLineInset", label: "Inset", min: 0, max: 7, step: 0.05, fallback: 2.6 },
  { key: "mergedInternalLineBaseCutoff", label: "Base Cut", min: 0, max: 0.6, step: 0.01, fallback: 0.18 },
  { key: "mergedInternalLineSideExposure", label: "Side Exposure", min: 0, max: 5, step: 0.05, fallback: 1.6 },
  { key: "mergedInternalLineOpacity", label: "Opacity", min: 0, max: 1, step: 0.02, fallback: 1 }
];

function mergedInternalLineSpec(key) {
  return MERGED_INTERNAL_LINE_FIELDS.find((field) => field.key === key);
}

function mergedInternalLineValueFor(character, key) {
  const spec = mergedInternalLineSpec(key);
  if (!spec) return 0;
  const traits = traitsFor(character, selectedExpressionFor(character));
  const raw = traits[key];
  return Number.isFinite(Number(raw)) ? Number(raw) : spec.fallback;
}

function setMergedInternalLineValue(character, key, value) {
  const spec = mergedInternalLineSpec(key);
  if (!spec) return;
  const next = { ...correctionFor(character.id) };
  const baseRaw = character.traits[key];
  const baseValue = Number.isFinite(Number(baseRaw)) ? Number(baseRaw) : spec.fallback;
  const numeric = Number(value);
  const normalized = normalizeNumber(Number.isFinite(numeric) ? numeric : spec.fallback);
  if (numbersEqual(normalized, baseValue)) delete next[key];
  else next[key] = normalized;
  setCorrection(character.id, next);
  refreshPortrait(character);
}

function effectiveInternalLine(inst) {
  return !!(inst && (inst.internalLine != null ? inst.internalLine : inst.outlineForce));
}

function lockRowMarkup(character, inst, i, n, hairHex, outlineHex, merged) {
  // Drawn (pen-tool) locks have no catalog key/transform — show a slimmed row.
  if (inst.d) return drawnRowMarkup(character, inst, i, hairHex, outlineHex, merged);
  // defHex = the auto colour shown when this part isn't overridden. 'outline' is special: its auto is
  // the global ink, and it has an on/off state (outline === 'none').
  const colorField = (part, defHex, label) => {
    const off = part === "outline" && inst.outline === "none";
    const set = inst[part] != null && inst[part] !== "none";
    const value = set ? inst[part] : defHex;
    return `
      <label class="lock-color ${set ? "is-set" : ""} ${off ? "is-off" : ""}">
        <span class="mini-colorrow"><input id="lock-color-${i}-${part}" type="color" value="${escapeHtml(value)}" data-lock-color="${part}">${miniSwatchButton(`lock-color-${i}-${part}`)}</span>
        <span>${label}</span>
        ${set ? `<button type="button" class="lock-color-reset" data-lock-reset="${part}" title="Auto colour">×</button>` : ""}
      </label>`;
  };
  const internalLineColorField = merged ? (() => {
    const set = inst.internalLineColor != null && inst.internalLineColor !== "none";
    const fallback = inst.outline === "none" ? outlineHex : (inst.outline || outlineHex);
    const value = set ? inst.internalLineColor : fallback;
    return `
      <label class="lock-color ${set ? "is-set" : ""}">
        <span class="mini-colorrow"><input id="lock-color-${i}-internalLineColor" type="color" value="${escapeHtml(value)}" data-lock-color="internalLineColor">${miniSwatchButton(`lock-color-${i}-internalLineColor`)}</span>
        <span>Internal</span>
        ${set ? `<button type="button" class="lock-color-reset" data-lock-reset="internalLineColor" title="Auto colour">×</button>` : ""}
      </label>`;
  })() : "";
  const internalLineWidth = Number.isFinite(Number(inst.internalLineWidth))
    ? Number(inst.internalLineWidth)
    : DEFAULT_INTERNAL_LINE_WIDTH;
  const internalLineWidthField = merged ? `
      <div class="lock-row-subcontrols">
        <label class="lock-num">Internal thickness <input type="range" min="0.6" max="${MAX_INTERNAL_LINE_WIDTH}" step="0.05" value="${internalLineWidth}" data-lock-num="internalLineWidth" ${effectiveInternalLine(inst) ? "" : "disabled"}><span class="editor-value">${formatNumber(internalLineWidth)}</span></label>
      </div>` : "";
  const swap = `<select class="lock-swap" data-lock-swap>${LOCK_CATALOG.map((c) => `<option value="${escapeHtml(c.key)}" ${c.key === inst.lock ? "selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}</select>`;
  return `
    <div class="lock-row" data-index="${i}" data-lock-droprow>
      <div class="lock-row-head">
        <span class="lock-grip" draggable="true" title="Drag to reorder">⠿</span>
        <span class="lock-row-num">${i + 1}</span>
        ${swap}
        <button type="button" class="mini-button" data-lock-reset-all title="Reset all colours for this lock">Reset colours</button>
        <button type="button" class="mini-button lock-del" data-lock-act="remove" title="Delete">✕</button>
      </div>
      <div class="lock-row-controls">
        <label class="lock-num">Size <input type="range" min="0.3" max="2" step="0.02" value="${inst.scale ?? 1}" data-lock-num="scale"><span class="editor-value">${formatNumber(inst.scale ?? 1)}</span></label>
        <label class="lock-num">Rotate <input type="range" min="-180" max="180" step="1" value="${inst.rot ?? 0}" data-lock-num="rot"><span class="editor-value">${formatNumber(inst.rot ?? 0)}</span></label>
      </div>
      <div class="lock-row-toggles">
        <label class="lock-toggle"><input type="checkbox" data-lock-lines ${inst.lines === false ? "" : "checked"}> Lines</label>
        <label class="lock-toggle"><input type="checkbox" data-lock-mirror ${inst.mirror ? "checked" : ""}> Mirror</label>
        <label class="lock-toggle"><input type="checkbox" data-lock-outline ${inst.outline === "none" ? "" : "checked"}> Outline</label>
        ${merged ? `<label class="lock-toggle"><input type="checkbox" data-lock-internal-line ${effectiveInternalLine(inst) ? "checked" : ""}> Internal line</label>` : ""}
        <label class="lock-toggle"><input type="checkbox" data-lock-behind ${inst.behind ? "checked" : ""}> Behind</label>
      </div>
      ${internalLineWidthField}
      <div class="lock-row-colors">
        ${colorField("fill", shadeHex(hairHex, 1), "Hair")}
        ${colorField("dark", shadeHex(hairHex, 0.5), "Shadow")}
        ${colorField("shine", shadeHex(hairHex, 1.3), "Shine")}
        ${colorField("line", shadeHex(hairHex, 0.62), "Lines")}
        ${colorField("outline", outlineHex, "Outline")}
        ${internalLineColorField}
      </div>
    </div>`;
}

// Slim editor row for a hand-drawn lock: reorder, delete, lines/outline toggles, and a fill swatch.
function drawnRowMarkup(character, inst, i, hairHex, outlineHex, merged) {
  const fill = inst.fill || shadeHex(hairHex, 1);
  return `
    <div class="lock-row" data-index="${i}" data-lock-droprow>
      <div class="lock-row-head">
        <span class="lock-grip" draggable="true" title="Drag to reorder">⠿</span>
        <span class="lock-row-num">${i + 1}</span>
        <span class="lock-drawn-tag">✏️ Drawn shape</span>
        <button type="button" class="mini-button" data-lock-reset-all title="Reset all colours for this lock">Reset colours</button>
        <button type="button" class="mini-button lock-del" data-lock-act="remove" title="Delete">✕</button>
      </div>
      <div class="lock-row-toggles">
        <label class="lock-toggle"><input type="checkbox" data-lock-lines ${inst.lines === false ? "" : "checked"}> Lines</label>
        <label class="lock-toggle"><input type="checkbox" data-lock-outline ${inst.outline === "none" ? "" : "checked"}> Outline</label>
      </div>
      <div class="lock-row-colors">
        <label class="lock-color is-set">
          <span class="mini-colorrow"><input id="drawn-lock-color-${i}-fill" type="color" value="${escapeHtml(fill)}" data-lock-color="fill">${miniSwatchButton(`drawn-lock-color-${i}-fill`)}</span><span>Colour</span>
        </label>
        <label class="lock-color ${inst.line ? "is-set" : ""}">
          <span class="mini-colorrow"><input id="drawn-lock-color-${i}-line" type="color" value="${escapeHtml(inst.line || shadeHex(hairHex, 0.62))}" data-lock-color="line">${miniSwatchButton(`drawn-lock-color-${i}-line`)}</span><span>Lines</span>
        </label>
      </div>
    </div>`;
}

function wireLockDesigner(character) {
  const root = els.editorControls.querySelector(".lock-designer");
  if (!root) return;
  const corrLocks = correctionFor(character.id).hairLocks;
  if (Array.isArray(corrLocks) && corrLocks.some((inst) => inst && inst.outlineForce && inst.internalLine == null)) {
    setLocks(character.id, corrLocks);
  }
  wireInlineSwatchButtons(root);
  const dye = root.querySelector("[data-hair-dye-color]");
  if (dye) dye.addEventListener("input", () => setHairDye(character, dye.value));
  const clearDye = root.querySelector("[data-hair-dye-clear]");
  if (clearDye) clearDye.addEventListener("click", () => setHairDye(character, null));
  root.querySelectorAll("[data-merged-line-num]").forEach((input) => {
    input.addEventListener("input", () => {
      root.querySelectorAll(`[data-pair="${cssEscape(input.dataset.pair)}"]`).forEach((peer) => {
        if (peer !== input) peer.value = input.value;
      });
      const value = Number(input.value);
      const wrap = input.closest(".lock-num");
      const valueLabel = wrap && wrap.querySelector(".editor-value");
      if (valueLabel) valueLabel.textContent = formatNumber(value);
      setMergedInternalLineValue(character, input.dataset.mergedLineNum, value);
    });
  });
  root.querySelectorAll(".lock-chip").forEach((chip) => {
    chip.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/lock", chip.dataset.lock));
    chip.addEventListener("click", () => addLock(character, chip.dataset.lock));
  });
  const clear = root.querySelector("[data-lock-clear]");
  if (clear) clear.addEventListener("click", () => { setLocks(character.id, []); render(); });
  root.querySelectorAll(".lock-row").forEach((row) => {
    const idx = Number(row.dataset.index);
    row.querySelectorAll("[data-lock-act]").forEach((btn) => {
      btn.addEventListener("click", () => lockAction(character, idx, btn.dataset.lockAct));
    });
    row.querySelectorAll("[data-lock-reset-all]").forEach((btn) => {
      btn.addEventListener("click", () => resetLockColors(character, idx));
    });
    row.querySelectorAll("[data-lock-num]").forEach((inp) => {
      inp.addEventListener("input", () => updateLockField(character, idx, inp.dataset.lockNum, Number(inp.value), inp));
    });
    const lines = row.querySelector("[data-lock-lines]");
    if (lines) lines.addEventListener("change", () => { setLockProp(character, idx, "lines", lines.checked); render(); });
    const mirror = row.querySelector("[data-lock-mirror]");
    if (mirror) mirror.addEventListener("change", () => { setLockProp(character, idx, "mirror", mirror.checked || undefined); render(); });
    const behind = row.querySelector("[data-lock-behind]");
    if (behind) behind.addEventListener("change", () => { setLockProp(character, idx, "behind", behind.checked || undefined); render(); });
    const outline = row.querySelector("[data-lock-outline]");
    if (outline) outline.addEventListener("change", () => {
      setLockProp(character, idx, "outline", outline.checked ? undefined : "none");
      render();
    });
    const internalLine = row.querySelector("[data-lock-internal-line]");
    if (internalLine) internalLine.addEventListener("change", () => {
      setLockProp(character, idx, "internalLine", internalLine.checked || undefined);
      setLockProp(character, idx, "outlineForce", undefined);
      render();
    });
    const swap = row.querySelector("[data-lock-swap]");
    if (swap) swap.addEventListener("change", () => { setLockProp(character, idx, "lock", swap.value); render(); });
    row.querySelectorAll("[data-lock-color]").forEach((inp) => {
      inp.addEventListener("input", () => setLockColor(character, idx, inp.dataset.lockColor, inp.value, false));
    });
    row.querySelectorAll("[data-lock-reset]").forEach((btn) => {
      btn.addEventListener("click", () => setLockColor(character, idx, btn.dataset.lockReset, null, true));
    });
    // Drag-to-reorder: the grip starts a drag, any row is a drop target.
    const grip = row.querySelector(".lock-grip");
    if (grip) {
      grip.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/lockidx", String(idx)); e.dataTransfer.effectAllowed = "move"; row.classList.add("is-dragging"); });
      grip.addEventListener("dragend", () => row.classList.remove("is-dragging"));
    }
    row.addEventListener("dragover", (e) => {
      if (![...e.dataTransfer.types].includes("text/lockidx")) return;
      e.preventDefault();
      row.classList.add("is-drop");
    });
    row.addEventListener("dragleave", () => row.classList.remove("is-drop"));
    row.addEventListener("drop", (e) => {
      const from = e.dataTransfer.getData("text/lockidx");
      if (from === "") return;
      e.preventDefault();
      row.classList.remove("is-drop");
      reorderLock(character, Number(from), idx);
    });
  });
  wirePenDesigner(character);
}

/* ===================== Pen Tool (draw custom hair) ===================== */

function wirePenDesigner(character) {
  const root = els.editorControls.querySelector(".pen-designer");
  if (!root) return;
  wireInlineSwatchButtons(root);
  const on = (sel, ev, fn) => { const el = root.querySelector(sel); if (el) el.addEventListener(ev, fn); };
  on("[data-pen-toggle]", "click", () => {
    state.pen.mode = !state.pen.mode;
    if (!state.pen.mode) resetPenPath();
    renderEditor(character);
    renderLockOverlay(character);
  });
  on("[data-pen-color]", "input", (e) => { state.pen.color = e.target.value; });
  on("[data-pen-outline]", "change", (e) => { state.pen.outline = e.target.checked; });
  on("[data-pen-lines]", "change", (e) => { state.pen.lines = e.target.checked; });
  on("[data-pen-finish]", "click", () => finishPenPath(character, false));
  on("[data-pen-save]", "click", () => finishPenPath(character, true));
  on("[data-pen-undo]", "click", () => { state.pen.pts.pop(); renderPenOverlay(); });
  on("[data-pen-cancel]", "click", () => { resetPenPath(); renderPenOverlay(); });
  root.querySelectorAll("[data-pen-apply]").forEach((b) => b.addEventListener("click", () => {
    const saved = readPenLocks()[Number(b.dataset.penApply)];
    if (saved) applyDrawnLock(character, { ...saved.inst });
  }));
  root.querySelectorAll("[data-pen-del]").forEach((b) => b.addEventListener("click", () => {
    const list = readPenLocks(); list.splice(Number(b.dataset.penDel), 1); savePenLocks(list);
    renderEditor(character);
  }));
}

function resetPenPath() { state.pen.pts = []; state.pen.dragging = -1; }

// Map a pointer event to 256-space portrait coordinates.
function penPoint(e) {
  const rect = els.penOverlay.getBoundingClientRect();
  return {
    x: clamp(((e.clientX - rect.left) / rect.width) * 256, 0, 256),
    y: clamp(((e.clientY - rect.top) / rect.height) * 256, 0, 256)
  };
}

// Build a smooth closed path from anchors. Each anchor's outgoing handle is (hx,hy); the incoming
// handle is its mirror. Segments with no handles fall back to straight lines.
function penPathData(pts, close) {
  if (pts.length < 2) return "";
  const n = pts.length;
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const c1x = a.x + (a.hx || 0), c1y = a.y + (a.hy || 0);
    const c2x = b.x - (b.hx || 0), c2y = b.y - (b.hy || 0);
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  if (close) d += "Z";
  return d;
}

// A few interior strand lines spanning the shape's bounding box (clipped to the shape at render).
function penStrokes(pts) {
  if (pts.length < 3) return [];
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const out = [];
  const N = Math.max(3, Math.min(6, Math.round((maxX - minX) / 14)));
  for (let i = 1; i <= N; i++) {
    const x = minX + ((maxX - minX) * i) / (N + 1);
    const bow = (maxX - minX) * 0.06 * (i % 2 ? 1 : -1);
    out.push(`M${x.toFixed(1)} ${(minY - 4).toFixed(1)}Q${(x + bow).toFixed(1)} ${((minY + maxY) / 2).toFixed(1)} ${x.toFixed(1)} ${(maxY + 4).toFixed(1)}`);
  }
  return out;
}

function currentPenInst() {
  const p = state.pen;
  const inst = { d: penPathData(p.pts, true), lines: p.lines };
  if (p.color) inst.fill = p.color;
  if (!p.outline) inst.outline = "none";
  if (p.lines) inst.strokes = penStrokes(p.pts);
  return inst;
}

function finishPenPath(character, asSaved) {
  if (state.pen.pts.length < 3) { resetPenPath(); renderPenOverlay(); return; }
  const inst = currentPenInst();
  if (asSaved) {
    const name = (prompt("Name this hair shape:", "My Lock") || "").trim();
    if (name) { const list = readPenLocks(); list.push({ name, inst }); savePenLocks(list); }
  }
  applyDrawnLock(character, inst);
  resetPenPath();
}

function applyDrawnLock(character, inst) {
  const arr = editableLocks(character.id);
  arr.push(inst);
  saveCorrections();
  state.pen.mode = false;
  render();
}

// Draw the in-progress path + its anchor/handle dots into the SVG overlay (256-space).
function renderPenOverlay() {
  if (!els.penOverlay) return;
  const p = state.pen;
  const col = p.color || "#3a2418";
  const preview = penPathData(p.pts, p.pts.length >= 3);
  const dots = p.pts.map((pt, i) => {
    const hx = pt.x + (pt.hx || 0), hy = pt.y + (pt.hy || 0);
    const handle = (pt.hx || pt.hy)
      ? `<line x1="${pt.x}" y1="${pt.y}" x2="${hx}" y2="${hy}" stroke="#3a86ff" stroke-width="1"/><circle cx="${hx}" cy="${hy}" r="2.6" fill="#3a86ff"/>`
      : "";
    const first = i === 0 ? ' stroke="#ffbe0b" stroke-width="2"' : ' stroke="#171512" stroke-width="1"';
    return `${handle}<circle cx="${pt.x}" cy="${pt.y}" r="3.2" fill="#fff"${first}/>`;
  }).join("");
  els.penOverlay.innerHTML = `
    ${preview ? `<path d="${preview}" fill="${col}55" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>` : ""}
    ${dots}`;
}

// One-time pointer wiring on the persistent overlay. Click drops an anchor; dragging the just-placed
// anchor pulls a symmetric bezier handle (Photoshop pen behaviour); clicking the first anchor closes.
function wirePenStageOnce() {
  if (!els.penOverlay) return;
  let active = -1;
  els.penOverlay.addEventListener("pointerdown", (e) => {
    if (!state.pen.mode) return;
    e.preventDefault();
    const pt = penPoint(e);
    const pts = state.pen.pts;
    // Close if clicking near the first anchor.
    if (pts.length >= 3) {
      const f = pts[0];
      if (Math.hypot(f.x - pt.x, f.y - pt.y) < 9) { finishPenPath(currentCharacter(), false); return; }
    }
    pts.push({ x: pt.x, y: pt.y, hx: 0, hy: 0 });
    active = pts.length - 1;
    els.penOverlay.setPointerCapture(e.pointerId);
    renderPenOverlay();
  });
  els.penOverlay.addEventListener("pointermove", (e) => {
    if (!state.pen.mode || active < 0) return;
    const pt = penPoint(e);
    const a = state.pen.pts[active];
    a.hx = pt.x - a.x;
    a.hy = pt.y - a.y;
    renderPenOverlay();
  });
  const end = (e) => {
    if (active < 0) return;
    try { els.penOverlay.releasePointerCapture(e.pointerId); } catch (_) {}
    active = -1;
  };
  els.penOverlay.addEventListener("pointerup", end);
  els.penOverlay.addEventListener("pointercancel", end);
}

function reorderLock(character, from, to) {
  if (from === to || Number.isNaN(from)) return;
  const locks = getLocks(character.id).slice();
  if (!locks[from]) return;
  const [item] = locks.splice(from, 1);
  locks.splice(to, 0, item);
  setLocks(character.id, locks);
  render();
}

function addLock(character, key, x, y) {
  const locks = getLocks(character.id).slice();
  locks.push({ lock: key, x: x == null ? 50 : Math.round(x), y: y == null ? 30 : Math.round(y), scale: 1, rot: 0, lines: true });
  setLocks(character.id, locks);
  render();
}

function lockAction(character, idx, act) {
  const locks = getLocks(character.id).slice();
  if (!locks[idx]) return;
  if (act === "remove") locks.splice(idx, 1);
  else if (act === "up" && idx < locks.length - 1) [locks[idx], locks[idx + 1]] = [locks[idx + 1], locks[idx]];
  else if (act === "down" && idx > 0) [locks[idx], locks[idx - 1]] = [locks[idx - 1], locks[idx]];
  else return;
  setLocks(character.id, locks);
  render();
}

function setLockProp(character, idx, prop, value) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  if (value === undefined) delete locks[idx][prop];
  else locks[idx][prop] = value;
  saveCorrections();
}

function updateLockField(character, idx, field, value, inp) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  locks[idx][field] = value;
  const span = inp.parentElement.querySelector(".editor-value");
  if (span) span.textContent = formatNumber(value);
  saveCorrections();
  refreshPortrait(character);
}

function setLockColor(character, idx, part, value, isReset) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  if (value == null) delete locks[idx][part];
  else locks[idx][part] = value;
  saveCorrections();
  if (isReset) render();
  else refreshPortrait(character);
}

function setHairDye(character, value) {
  const next = { ...correctionFor(character.id) };
  const undyed = character.traits.hairHex || namedHairHexFor(character);
  if (!value || toHex(value) === toHex(undyed)) delete next.hairHex;
  else next.hairHex = toHex(value);
  setCorrection(character.id, next);
  render();
}

function resetLockColors(character, idx) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  ["fill", "dark", "shine", "line", "outline", "internalLineColor"].forEach((key) => delete locks[idx][key]);
  saveCorrections();
  render();
}

// Lightweight: re-render only the selected portrait + lock markers + export (no grid/editor rebuild),
// so dragging a marker or a colour slider stays smooth.
function refreshPortrait(character) {
  const index = characters.indexOf(character);
  const expression = selectedExpressionFor(character);
  pendingPortraitRefresh = {
    character,
    index,
    expression,
    alt: escapeHtml(character.name)
  };
  if (portraitRefreshFrame) return;
  portraitRefreshFrame = requestAnimationFrame(() => {
    portraitRefreshFrame = 0;
    if (!pendingPortraitRefresh) return;
    const { character: activeCharacter, index: activeIndex, expression: activeExpression, alt } = pendingPortraitRefresh;
    const src = portraitFor(activeCharacter, activeIndex, activeExpression);
    const img = els.selectedPortrait.querySelector("img");
    if (img) {
      if (img.src !== src) img.src = src;
    } else {
      els.selectedPortrait.innerHTML = `<img src="${src}" alt="${alt}">`;
    }
    positionLockMarkers(activeCharacter);
    renderCorrectionExport();
    pendingPortraitRefresh = null;
  });
}

function renderLockOverlay(character) {
  if (!els.lockOverlay) return;
  const hairMode = state.activeGroup === "Hair";
  const beardMode = state.activeGroup === "Beard";
  const penMode = hairMode && state.pen.mode;
  // Pen mode owns the portrait surface: hide lock markers + hotspots, show the drawing overlay.
  if (els.penOverlay) {
    els.penOverlay.hidden = !penMode;
    els.penOverlay.style.cursor = penMode ? "crosshair" : "";
  }
  if (penMode) {
    els.lockOverlay.hidden = true;
    els.lockOverlay.innerHTML = "";
    if (els.portraitHotspots) els.portraitHotspots.style.display = "none";
    if (els.hotspotHint) {
      els.hotspotHint.hidden = false;
      els.hotspotHint.textContent = "Pen tool active — draw the hair shape on the portrait.";
    }
    renderPenOverlay();
    return;
  }
  const overlayMode = hairMode || beardMode;
  els.lockOverlay.hidden = !overlayMode;
  if (els.portraitHotspots) els.portraitHotspots.style.display = overlayMode ? "none" : "";
  if (els.hotspotHint) {
    els.hotspotHint.hidden = !overlayMode;
    els.hotspotHint.textContent = hairMode
      ? "Drag a lock from the palette onto the hair · drag a marker to reposition"
      : beardMode
        ? "Drag the beard blobs on the face · they mirror automatically"
        : "";
  }
  if (!overlayMode) { els.lockOverlay.innerHTML = ""; return; }
  if (beardMode) {
    const blobs = getBeardBlobs(character.id);
    els.lockOverlay.innerHTML = blobs
      .map((b, i) => `<button type="button" class="lock-marker beard-marker" data-bindex="${i}" style="left:${((128 + Math.abs(Number(b.dx) || 0)) / 256 * 100).toFixed(1)}%; top:${((Number(b.y) || 196) / 256 * 100).toFixed(1)}%;" title="Beard blob — drag to move (mirrors)">${i + 1}</button>`)
      .join("");
    els.lockOverlay.querySelectorAll(".beard-marker").forEach((marker) => wireBeardMarker(marker, character));
    return;
  }
  const locks = getLocks(character.id);
  els.lockOverlay.innerHTML = locks
    .map((inst, i) => ({ inst, i }))
    // Drawn (pen) locks have no x/y anchor — they're edited from the stack, not via a marker.
    .filter(({ inst }) => !inst.d)
    .map(({ inst, i }) => `<button type="button" class="lock-marker ${inst.behind ? "is-behind" : ""}" data-index="${i}" style="left:${inst.x}%; top:${inst.y == null ? 32 : inst.y}%;" title="${escapeHtml(lockLabel(inst.lock))}${inst.behind ? " (behind)" : ""} — drag to move">${i + 1}</button>`)
    .join("");
  els.lockOverlay.querySelectorAll(".lock-marker").forEach((marker) => wireLockMarker(marker, character));
}

function positionLockMarkers(character) {
  const locks = getLocks(character.id);
  els.lockOverlay.querySelectorAll(".lock-marker").forEach((marker) => {
    const inst = locks[Number(marker.dataset.index)];
    if (!inst) return;
    marker.style.left = `${inst.x}%`;
    marker.style.top = `${inst.y == null ? 32 : inst.y}%`;
  });
}

function wireLockMarker(marker, character) {
  marker.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const idx = Number(marker.dataset.index);
    const inst = editableLocks(character.id)[idx];
    if (!inst) return;
    const rect = els.lockOverlay.getBoundingClientRect();
    marker.setPointerCapture(e.pointerId);
    marker.classList.add("is-dragging");
    const move = (ev) => {
      inst.x = Math.round(clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100));
      inst.y = Math.round(clamp(((ev.clientY - rect.top) / rect.height) * 100, 0, 100));
      marker.style.left = `${inst.x}%`;
      marker.style.top = `${inst.y}%`;
      refreshPortrait(character);
    };
    const up = () => {
      marker.releasePointerCapture(e.pointerId);
      marker.classList.remove("is-dragging");
      marker.removeEventListener("pointermove", move);
      marker.removeEventListener("pointerup", up);
      saveCorrections();
      render();
    };
    marker.addEventListener("pointermove", move);
    marker.addEventListener("pointerup", up);
  });
}

// Drop target wiring is attached once (the overlay element persists across renders).
function wireLockStageOnce() {
  if (!els.lockOverlay) return;
  els.lockOverlay.addEventListener("dragover", (e) => { e.preventDefault(); els.lockOverlay.classList.add("is-drop"); });
  els.lockOverlay.addEventListener("dragleave", () => els.lockOverlay.classList.remove("is-drop"));
  els.lockOverlay.addEventListener("drop", (e) => {
    e.preventDefault();
    els.lockOverlay.classList.remove("is-drop");
    const key = e.dataTransfer.getData("text/lock");
    if (!key) return;
    const rect = els.lockOverlay.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    addLock(currentCharacter(), key, x, y);
  });
}

/* ===================== Beard Blob Designer ===================== *
 * Per-character mirrored "blob" beard. Stored as corrections[id].beardBlobs = [{ dx, y, r }] in head
 * pixels (dx = distance from the x=128 centreline, auto-mirrored). The generator draws the union
 * outline (renderBeardBlobs). Markers show on the right side; dragging sets dx/y, the twin mirrors. */
function getBeardBlobs(id) {
  const corr = correctionFor(id).beardBlobs;
  if (Array.isArray(corr)) return corr;
  const ch = characters.find((c) => c.id === id);
  const base = ch && ch.traits && ch.traits.beardBlobs;
  return Array.isArray(base) ? base : [];
}
function editableBeardBlobs(id) {
  if (!Array.isArray(correctionFor(id).beardBlobs)) {
    setBeardBlobs(id, getBeardBlobs(id).map((b) => ({ ...b })));
  }
  return correctionFor(id).beardBlobs;
}
function setBeardBlobs(id, arr) {
  const next = { ...correctionFor(id) };
  if (arr && arr.length) next.beardBlobs = arr;
  else delete next.beardBlobs;
  setCorrection(id, next);
}

function beardDesignerMarkup(character) {
  const blobs = getBeardBlobs(character.id);
  const rows = blobs.length
    ? blobs.map((b, i) => `
        <div class="lock-row" data-bindex="${i}">
          <div class="lock-row-head">
            <span class="lock-row-num">${i + 1}</span>
            <label class="lock-num">Size <input type="range" min="6" max="48" step="1" value="${b.r ?? 16}" data-beard-r><span class="editor-value">${formatNumber(b.r ?? 16)}</span></label>
            <label class="lock-num">Spread <input type="range" min="0" max="90" step="1" value="${Math.abs(b.dx ?? 30)}" data-beard-dx><span class="editor-value">${formatNumber(Math.abs(b.dx ?? 30))}</span></label>
            <button type="button" class="mini-button lock-del" data-beard-del title="Delete">✕</button>
          </div>
        </div>`).join("")
    : `<p class="lock-empty">No beard blobs — click "+ Blob", then drag them on the face (they mirror automatically).</p>`;
  return `
    <div class="lock-designer">
      <div class="lock-designer-head">
        <p class="meta-label">Beard Blobs</p>
        <div style="display:flex; gap:6px;">
          <button type="button" class="mini-button" data-beard-add>+ Blob</button>
          ${blobs.length ? `<button type="button" class="mini-button" data-beard-clear>Clear</button>` : ""}
        </div>
      </div>
      <div class="lock-stack">${rows}</div>
    </div>`;
}

function wireBeardDesigner(character) {
  const root = els.editorControls.querySelector(".lock-designer");
  if (!root) return;
  const add = root.querySelector("[data-beard-add]");
  if (add) add.addEventListener("click", () => addBeardBlob(character));
  const clear = root.querySelector("[data-beard-clear]");
  if (clear) clear.addEventListener("click", () => { setBeardBlobs(character.id, []); render(); });
  root.querySelectorAll(".lock-row").forEach((row) => {
    const idx = Number(row.dataset.bindex);
    const r = row.querySelector("[data-beard-r]");
    if (r) r.addEventListener("input", () => updateBeardField(character, idx, "r", Number(r.value), r));
    const dx = row.querySelector("[data-beard-dx]");
    if (dx) dx.addEventListener("input", () => updateBeardField(character, idx, "dx", Number(dx.value), dx));
    const del = row.querySelector("[data-beard-del]");
    if (del) del.addEventListener("click", () => removeBeardBlob(character, idx));
  });
}

function addBeardBlob(character) {
  const blobs = getBeardBlobs(character.id).slice();
  blobs.push({ dx: 30, y: 198, r: 16 });
  setBeardBlobs(character.id, blobs);
  render();
}
function removeBeardBlob(character, idx) {
  const blobs = getBeardBlobs(character.id).slice();
  if (!blobs[idx]) return;
  blobs.splice(idx, 1);
  setBeardBlobs(character.id, blobs);
  render();
}
function updateBeardField(character, idx, field, value, inp) {
  const blobs = editableBeardBlobs(character.id);
  if (!blobs[idx]) return;
  blobs[idx][field] = value;
  const span = inp.parentElement.querySelector(".editor-value");
  if (span) span.textContent = formatNumber(value);
  saveCorrections();
  refreshPortrait(character);
}

function wireBeardMarker(marker, character) {
  marker.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const idx = Number(marker.dataset.bindex);
    const blob = editableBeardBlobs(character.id)[idx];
    if (!blob) return;
    const rect = els.lockOverlay.getBoundingClientRect();
    marker.setPointerCapture(e.pointerId);
    marker.classList.add("is-dragging");
    const move = (ev) => {
      const hx = ((ev.clientX - rect.left) / rect.width) * 256;
      const hy = ((ev.clientY - rect.top) / rect.height) * 256;
      blob.dx = Math.round(clamp(Math.abs(hx - 128), 0, 100));
      blob.y = Math.round(clamp(hy, 110, 250));
      marker.style.left = `${((128 + blob.dx) / 256 * 100).toFixed(1)}%`;
      marker.style.top = `${(blob.y / 256 * 100).toFixed(1)}%`;
      refreshPortrait(character);
    };
    const up = () => {
      marker.releasePointerCapture(e.pointerId);
      marker.classList.remove("is-dragging");
      marker.removeEventListener("pointermove", move);
      marker.removeEventListener("pointerup", up);
      saveCorrections();
      render();
    };
    marker.addEventListener("pointermove", move);
    marker.addEventListener("pointerup", up);
  });
}
