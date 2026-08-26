import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Scene3D } from './Scene3D';
import { LoaderOverlayHUD } from './LoaderOverlayHUD';
import { CaseAnalysisLoaderProps } from './types';

// Fallback spinner if WebGL is initializing or suspended
const CanvasFallback: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0705]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-lg border-2 border-[#C4622D] border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-[#E8B896] tracking-widest uppercase">
        INITIALIZING 3D NEURAL CORE...
      </span>
    </div>
  </div>
);

export const CaseAnalysisLoader: React.FC<CaseAnalysisLoaderProps> = ({
  stage,
  progress,
  caseTitle,
  priority,
  investigator,
  totalRecords,
  totalEntities,
  className = '',
}) => {
  return (
    <AnimatePresence>
      <motion.div
        key="case-analysis-loader-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.6 } }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed inset-0 z-50 overflow-hidden bg-[#0A0705] flex items-center justify-center ${className}`}
        style={{
          width: '100vw',
          height: '100vh',
        }}
      >
        {/* Subtle background radial ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 45%, rgba(196, 98, 45, 0.12) 0%, rgba(140, 61, 26, 0.05) 40%, rgba(10, 7, 5, 0.95) 75%)',
          }}
        />

        {/* Real-time Three.js 3D Scene Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              camera={{ position: [0, 0, 7.2], fov: 42 }}
              dpr={[1, 1.5]}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
              }}
              className="w-full h-full"
            >
              <Scene3D progress={progress} />
            </Canvas>
          </Suspense>
        </div>

        {/* Forensic HUD Progress & Telemetry Overlay */}
        <LoaderOverlayHUD
          stage={stage}
          progress={progress}
          caseTitle={caseTitle}
          priority={priority}
          investigator={investigator}
          totalRecords={totalRecords}
          totalEntities={totalEntities}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CaseAnalysisLoader;
