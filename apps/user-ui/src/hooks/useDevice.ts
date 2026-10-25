'use client';

import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

export const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parser = new UAParser(window.navigator.userAgent);
      const result = parser.getResult();
      const deviceType = result.device.type || 'Desktop';
      const os = result.os.name || '';
      const browser = result.browser.name || '';
      setDeviceInfo(`${deviceType} - ${os} - ${browser}`.trim());
    }
  }, []);

  return deviceInfo;
};

export const useDevice = useDeviceTracking;
export default useDeviceTracking;