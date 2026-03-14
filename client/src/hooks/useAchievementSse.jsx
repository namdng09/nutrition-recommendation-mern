import { Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

const useAchievementSse = (token, enabled = true) => {
  useEffect(() => {
    if (!token || !enabled) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/achievements/sse?token=${token}`
    );

    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'achievement_unlocked') {
          toast.dismiss();
          toast.success(data.achievement.name, {
            description: data.achievement.description,
            icon: <Trophy className='text-warning' />,
            duration: 5000
          });
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [token, enabled]);
};

export default useAchievementSse;
