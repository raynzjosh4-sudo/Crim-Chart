import { useState, useEffect } from 'react';

export function useTooltipSchedule(isDismissed: boolean) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDismissed) {
      setVisible(false);
      return;
    }

    let currentTimeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const runSchedule = async () => {
      let waitTime = 0;
      let showTime = 3000;

      while (isMounted && !isDismissed) {
        // Wait phase
        if (waitTime > 0) {
          await new Promise(resolve => {
            currentTimeout = setTimeout(resolve, waitTime);
          });
        }

        if (!isMounted || isDismissed) break;

        // Show phase
        setVisible(true);

        await new Promise(resolve => {
          currentTimeout = setTimeout(resolve, showTime);
        });

        if (!isMounted || isDismissed) break;

        // Hide phase
        setVisible(false);

        // Calculate next cycle
        if (waitTime === 0) {
          waitTime = 10000; // Next wait is 10s
        } else if (waitTime === 10000) {
          waitTime = 20000; // Next wait is 20s
          showTime = 4000;  // Show for 4s
        } else {
          waitTime *= 2;    // Double wait time after that
          showTime = 4000;
        }
      }
    };

    runSchedule();

    return () => {
      isMounted = false;
      clearTimeout(currentTimeout);
    };
  }, [isDismissed]);

  return visible;
}
