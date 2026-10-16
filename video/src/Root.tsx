import { Composition } from "remotion";
import { TheWall, COMPOSITION } from "./TheWall";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="the-wall"
        component={TheWall}
        durationInFrames={COMPOSITION.durationInFrames}
        fps={COMPOSITION.fps}
        width={COMPOSITION.width}
        height={COMPOSITION.height}
      />
    </>
  );
};
