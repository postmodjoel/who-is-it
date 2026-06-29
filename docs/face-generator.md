# Face Generator

The generator is built from isolated factors so a person can keep the same identity while swapping expression, outfit, or accessories.

## Stable Identity

- `faceShape`: oval, round, heart, square, long
- `skin`: porcelain, fair, tan, amber, brown, deep
- `hair`: messy, bob, long waves, curls, coily, locs, bun, cropped, bald, hijab
- `hairColor`: black, blue-black, dark brown, brown, auburn, copper, blonde, silver, pink
- `eyeColor`: green, blue, brown, violet

## Expression Overlay

Each expression owns eyebrows, eyes, cheeks, and mouth shape.

- `neutral`: calm brows, relaxed eyes, flat mouth
- `happy`: lifted brows, bright eyes, smiling mouth, cheek blush
- `surprised`: high brows, wide eyes, open mouth
- `angry`: inward brows, narrowed eyes, tense frown
- `sad`: worried brows, soft eyes, downturned mouth

## Styling Layers

- `clothing`: hoodie, tee, collared, jacket, turtleneck, overalls
- `accessory`: glasses, round glasses, hoop earrings, beard, moustache, necklace, bow tie, cap, beanie, beret, headband, flower clip, bucket hat
- `background`: pastel card color, independent from the person

## Game Use

Good Guess Who questions come from visible factors, not hidden data.

- "Does your person have a head covering?"
- "Does your person look surprised?"
- "Does your person have facial hair?"
- "Is your person wearing glasses?"
- "Does your person have long hair?"
- "Is your person wearing a hoodie?"

The current implementation lives in `face-generator.js` and returns game-ready character records with `traits`, `feature`, `secret`, `role`, and generated SVG image data.
