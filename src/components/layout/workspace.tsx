"use client";

import { motion } from "framer-motion";

import { LeftRailSection } from "@/components/sections/left-rail-section";
import { MainWorkspaceSection } from "@/components/sections/main-workspace-section";
import { RightActionSection } from "@/components/sections/right-action-section";

const columnMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function Workspace() {
  return (
    <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(620px,1fr)_340px]">
        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.22, delay: 0.02 }}
        >
          <LeftRailSection />
        </motion.div>

        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.22, delay: 0.08 }}
        >
          <MainWorkspaceSection />
        </motion.div>

        <motion.div
          variants={columnMotion}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.22, delay: 0.14 }}
        >
          <RightActionSection />
        </motion.div>
      </div>
    </main>
  );
}
