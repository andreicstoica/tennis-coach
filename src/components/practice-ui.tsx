import { motion, useSpring, useTransform } from "framer-motion";
import type { MouseEventHandler } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type PracticeUiProps = {
  warmup: string;
  drill: string;
  game: string;
};

export function PracticeUi({ warmup, drill, game }: PracticeUiProps) {
  // 'hyper parameters'
  const cardRotation = 15;
  const cardScale = 1.03;

  // need to declare vals as framer motion values for card movement
  const scale = useSpring(1, { bounce: 0, damping: 20, stiffness: 300 });
  const xPercent = useSpring(0, { bounce: 0, damping: 20, stiffness: 300 });
  const yPercent = useSpring(0, { bounce: 0, damping: 20, stiffness: 300 });
  const rotateX = useTransform(
    yPercent,
    [-0.5, 0.5],
    [`-${cardRotation}deg`, `${cardRotation}deg`],
  );
  const rotateY = useTransform(
    xPercent,
    [-0.5, 0.5],
    [`-${cardRotation}deg`, `${cardRotation}deg`],
  );

  const getMousePosition = (event: React.MouseEvent<Element, MouseEvent>) => {
    const currentTarget = event.currentTarget as HTMLElement;
    const rect = currentTarget.getBoundingClientRect();

    const currentMouseX = event.clientX - rect.left;
    const currentMouseY = event.clientY - rect.top;

    return {
      currentMouseX,
      currentMouseY,
      containerWidth: rect.width,
      containerHeight: rect.height,
    };
  };

  const handleMouseMove: MouseEventHandler = (event) => {
    const { currentMouseX, currentMouseY, containerWidth, containerHeight } =
      getMousePosition(event);

    xPercent.set(currentMouseX / containerWidth - 0.5);
    yPercent.set(currentMouseY / containerHeight - 0.5);
  };

  const handleMouseLeave = () => {
    xPercent.set(0);
    yPercent.set(0);

    scale.set(1);
  };

  const handleMouseEnter: MouseEventHandler = () => {
    scale.set(cardScale);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="w-[80%]"
      style={{ transformStyle: "preserve-3d", rotateX, rotateY, scale }}
      transformTemplate={({ rotateX, rotateY, scale }) =>
        `perspective(1000px) rotateX(${rotateX}) rotateY(${rotateY}) scale(${scale})`
      }
    >
      <Card
        className="group relative shadow-2xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        <CardHeader>
          <CardTitle>Coach</CardTitle>
        </CardHeader>
        <CardContent className="text-pretty">
          <div className="font-bold">Warmup</div>
          {warmup}
        </CardContent>
        <CardContent className="text-pretty">
          <div className="font-bold">Drill</div>
          {drill}
        </CardContent>
        <CardContent className="text-pretty">
          <div className="font-bold">Game</div>
          {game}
        </CardContent>
        <Badge
          variant="secondary"
          className="absolute top-6 right-4 z-10 rotate-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          Just a little fun :) 🎾
        </Badge>
      </Card>
    </motion.div>
  );
}
