import { Composition } from "remotion";
import { TheWall, THE_WALL_DURATION } from "./TheWall";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="the-wall"
        component={TheWall}
        durationInFrames={THE_WALL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
