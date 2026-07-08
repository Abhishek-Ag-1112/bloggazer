import React, { useEffect } from 'react';
import { seoConfig } from '../utils/seoConfig';

interface AdUnitProps {
  slotId: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ 
  slotId, 
  style = { display: 'block', minHeight: '100px' }, 
  format = 'auto', 
  responsive = 'true' 
}) => {
  useEffect(() => {
    try {
      const win = window as any;
      (win.adsbygoogle = win.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error: ", e);
    }
  }, []);

  return (
    <div className="ad-container my-8 flex justify-center w-full overflow-hidden select-none">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={seoConfig.publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default AdUnit;
