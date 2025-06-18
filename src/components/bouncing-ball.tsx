"use client";

import Image from "next/image";
import type React from "react";
import { useState, useEffect, useRef } from "react";

// Physics constants
const GRAVITY = 0.2;
const FORM_BOUNCE_FACTOR = -0.65;
const FLOOR_BOUNCE_FACTOR = -0.5; // Slightly less bounce from the floor
const HORIZONTAL_DAMPING = 0.98;
const BALL_SIZE = 27;
const SPAWN_INTERVAL = 2200;
const MAX_BALLS = 12;
const FRICTION = 0.9;

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVelocity: number;
  scale: { x: number; y: number };
}

interface FormDimensions {
  top: number;
  left: number;
  right: number;
  height: number;
}

interface BouncingBallAnimationProps {
  ref: React.RefObject<HTMLElement | null>;
}

export const BouncingBallAnimation: React.FC<BouncingBallAnimationProps> = ({
  ref,
}) => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const [formDims, setFormDims] = useState<FormDimensions | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const updateDimensions = () => {
      if (animationContainerRef.current) {
        setContainerWidth(window.innerWidth);
        setContainerHeight(window.innerHeight);
      }
      if (node) {
        const rect = node.getBoundingClientRect();
        setFormDims({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          height: rect.height,
        });
      } else {
        setFormDims(null); // Form not present or not rendered yet
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (node) {
      observer.observe(node);
    }
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions, { passive: true }); // Use passive for scroll

    return () => {
      if (node) {
        observer.unobserve(node);
      }
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, [ref]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBalls((prevBalls) => {
        if (prevBalls.length >= MAX_BALLS || containerWidth === 0) {
          return prevBalls;
        }
        const newBall: Ball = {
          id: Date.now() + Math.random(),
          x: Math.random() * (containerWidth - BALL_SIZE),
          y: -BALL_SIZE,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 2 + 1,
          rotation: Math.random() * 360,
          angularVelocity: (Math.random() - 0.5) * 8,
          scale: { x: 1, y: 1 },
        };
        return [...prevBalls, newBall];
      });
    }, SPAWN_INTERVAL);
    return () => clearInterval(intervalId);
  }, [containerWidth]);

  useEffect(() => {
    if (containerHeight === 0) return; // Don't run animation if container not measured

    let animationFrameId: number;
    const updateAnimation = () => {
      setBalls((prevBalls) =>
        prevBalls
          .map((ball) => {
            let newVx = ball.vx * HORIZONTAL_DAMPING;
            let newVy = ball.vy + GRAVITY;
            let newX = ball.x + newVx;
            let newY = ball.y + newVy;
            const newRotation = (ball.rotation + ball.angularVelocity) % 360;
            let newAngularVelocity = ball.angularVelocity;
            let newScale = { x: 1, y: 1 };

            // Wall bounces
            if (newX < 0) {
              newX = 0;
              newVx = -newVx * FRICTION;
              newAngularVelocity =
                -newAngularVelocity * 0.8 + (Math.random() - 0.5) * 3;
            } else if (newX > containerWidth - BALL_SIZE) {
              newX = containerWidth - BALL_SIZE;
              newVx = -newVx * FRICTION;
              newAngularVelocity =
                -newAngularVelocity * 0.8 + (Math.random() - 0.5) * 3;
            }

            let bouncedThisFrame = false;

            // Form bounce
            if (
              formDims &&
              newY + BALL_SIZE > formDims.top && // Ball's bottom edge is below form's top
              ball.y + BALL_SIZE <= formDims.top && // Ball's bottom edge was above or at form's top in previous frame
              newX + BALL_SIZE > formDims.left && // Ball's right edge is past form's left edge
              newX < formDims.right // Ball's left edge is before form's right edge
            ) {
              newY = formDims.top - BALL_SIZE;
              newVy = ball.vy * FORM_BOUNCE_FACTOR;
              newVx = newVx * FRICTION + (Math.random() - 0.5) * 0.8;
              const impactForce = Math.min(Math.abs(ball.vy) / 10, 0.4);
              newScale = { x: 1 + impactForce, y: 1 - impactForce };
              newAngularVelocity = newVx * 2 + (Math.random() - 0.5) * 4;
              if (Math.abs(newVy) < 1.5) newVy *= 0.8;
              bouncedThisFrame = true;
            }

            // Floor bounce (if not bounced off form in the same frame)
            if (!bouncedThisFrame && newY > containerHeight - BALL_SIZE) {
              newY = containerHeight - BALL_SIZE;
              newVy = ball.vy * FLOOR_BOUNCE_FACTOR;
              newVx = newVx * FRICTION;
              const impactForce = Math.min(Math.abs(ball.vy) / 10, 0.3); // Less squash on floor
              newScale = { x: 1 + impactForce, y: 1 - impactForce };
              newAngularVelocity = newVx * 1.5 + (Math.random() - 0.5) * 3;
              if (Math.abs(newVy) < 1) newVy = 0;
            }

            // Restore ball shape
            if (ball.scale.x !== 1 || ball.scale.y !== 1) {
              newScale = {
                x: ball.scale.x * 0.8 + 0.2,
                y: ball.scale.y * 0.8 + 0.2,
              };
              if (Math.abs(newScale.x - 1) < 0.01) newScale.x = 1;
              if (Math.abs(newScale.y - 1) < 0.01) newScale.y = 1;
            }

            return {
              ...ball,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy,
              rotation: newRotation,
              angularVelocity: newAngularVelocity,
              scale: newScale,
            };
          })
          .filter((ball) => {
            const isWayBelowScreen = ball.y > containerHeight + BALL_SIZE * 3;
            // Remove if stopped on floor OR if vy is 0 (settled) and on floor

            return !isWayBelowScreen;
          }),
      );
      animationFrameId = requestAnimationFrame(updateAnimation);
    };

    animationFrameId = requestAnimationFrame(updateAnimation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [formDims, containerWidth, containerHeight]); // Rerun if these change

  return (
    <div ref={animationContainerRef} className="h-full w-full">
      {balls.map((ball) => (
        <div
          key={ball.id}
          className="absolute"
          style={{
            left: ball.x,
            top: ball.y,
            width: BALL_SIZE,
            height: BALL_SIZE,
            transform: `rotate(${ball.rotation}deg) scale(${ball.scale.x}, ${ball.scale.y})`,
            transformOrigin: "center center",
          }}
        >
          <Image
            src="/tennis-ball.svg"
            alt=""
            width={50}
            height={50}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
};
