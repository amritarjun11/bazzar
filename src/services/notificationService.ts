import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        this.swRegistration = registration;
        this.isInitialized = true;
        console.log('✅ BazaarReels Service Worker registered for background push notifications.');
      } catch (err) {
        console.warn('Service worker registration warning:', err);
      }
    }
  }

  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.init();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }

  /**
   * Display a push/native notification on device, even when tab is backgrounded
   */
  async showNotification(payload: NotificationPayload): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    try {
      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        const options: any = {
          body: payload.body,
          icon: payload.icon || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=192&q=80',
          badge: payload.icon || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=192&q=80',
          vibrate: [200, 100, 200],
          tag: payload.tag || 'bazaar-message',
          data: {
            url: payload.url || '/',
          },
        };
        await this.swRegistration.showNotification(payload.title, options);
        return true;
      } else {
        // Fallback to standard window Notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
        });
        return true;
      }
    } catch (err) {
      console.warn('Failed to display native notification:', err);
      return false;
    }
  }

  /**
   * Save device push subscription to Supabase so backend edge functions
   * can trigger background push when the user is offline/app is closed.
   */
  async saveSubscriptionToSupabase(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !this.swRegistration) return false;

    try {
      // VAPID public key (optional if using Supabase web push edge function)
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (subscription) {
        const { error } = await supabase.from('push_subscriptions').upsert({
          user_id: userId,
          subscription_data: subscription.toJSON(),
          updated_at: new Date().toISOString(),
        });
        return !error;
      }
      return false;
    } catch (err) {
      console.warn('Supabase push subscription registration notice:', err);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
