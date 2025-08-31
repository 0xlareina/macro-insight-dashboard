// CryptoSense Dashboard - Alert Service
import { MarketAlert } from '../types';

export class AlertService {
  private static notifications: Notification[] = [];
  private static soundEnabled = true;
  
  static processAlert(alert: MarketAlert): void {
    // Play sound if enabled
    if (this.soundEnabled && alert.severity !== 'low') {
      this.playAlertSound(alert.severity);
    }
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      this.showNotification(alert);
    }
    
    // Log alert
    console.log(`🚨 Alert [${alert.severity.toUpperCase()}]:`, alert.message);
  }
  
  private static playAlertSound(severity: string): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequency = severity === 'critical' ? 800 : severity === 'high' ? 600 : 400;
    const duration = severity === 'critical' ? 1000 : 500;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }
  
  private static showNotification(alert: MarketAlert): void {
    const notification = new Notification(`CryptoSense Alert - ${alert.severity.toUpperCase()}`, {
      body: alert.message,
      icon: '/favicon.png',
      tag: alert.id,
      requireInteraction: alert.severity === 'critical',
    });
    
    this.notifications.push(notification);
    
    // Auto-close after 5 seconds for non-critical alerts
    if (alert.severity !== 'critical') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
  
  static requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }
  
  static setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }
  
  static clearAllNotifications(): void {
    this.notifications.forEach(notification => {
      notification.close();
    });
    this.notifications = [];
  }
}