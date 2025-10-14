import { HeroHighlight, Highlight } from "./ui/hero-highlight";
import { motion } from "motion/react";

const HeroSection = () => {
  return (
    <div className="w-full h-dvh flex">
      {/* Left div */}
      <div className="h-full flex-1">
        <HeroHighlight>
          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: [20, -5, 0],
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
          >
            Capture your thoughts and find clarity with ZenJournal.{" "}
            <Highlight className="text-black dark:text-white">
              a moment for the calm mind.
            </Highlight>
          </motion.h1>
        </HeroHighlight>
      </div>
    </div>
  );
};

export default HeroSection;
