// src/components/PageLoader.tsx
import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen" aria-label="Loading page">
      {/* Container: 112px -> 56px */}
      <div className="relative w-[56px] h-[56px]">
        {/* Box 1: border 16px -> 8px, sizes halved, animation 4s -> 2s */}
        <div
          className="absolute box-border border-[8px] border-blue-600 dark:border-blue-400
                     w-[56px] h-[24px] mt-[32px] ml-[0px]
                     animate-[abox1_2s_0.5s_forwards_ease-in-out_infinite]"
        ></div>
        {/* Box 2: border 16px -> 8px, sizes halved, animation 4s -> 2s */}
        <div
          className="absolute box-border border-[8px] border-blue-600 dark:border-blue-400
                     w-[24px] h-[24px] mt-[0px] ml-[0px]
                     animate-[abox2_2s_0.5s_forwards_ease-in-out_infinite]"
        ></div>
        {/* Box 3: border 16px -> 8px, sizes halved, animation 4s -> 2s */}
        <div
          className="absolute box-border border-[8px] border-blue-600 dark:border-blue-400
                     w-[24px] h-[24px] mt-[0px] ml-[32px]
                     animate-[abox3_2s_0.5s_forwards_ease-in-out_infinite]"
        ></div>
      </div>
    </div>
  );
};

export default PageLoader;