import { useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export function useImmersiveMode() {
  const isAndroid = Platform.OS === 'android';
  const restored = useRef(false);

  useEffect(() => {
    if (!isAndroid) return;

    let cancelled = false;

    async function enable() {
      try {
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setVisibilityAsync('hidden');
      } catch {
        // silently degrade if edge-to-edge is active or API unavailable
      }
    }

    async function disable() {
      if (restored.current) return;
      restored.current = true;
      try {
        await NavigationBar.setVisibilityAsync('visible');
        await NavigationBar.setBehaviorAsync('inset-touch');
        await NavigationBar.setPositionAsync('relative');
      } catch {
        // silently degrade
      }
    }

    enable();

    const sub = AppState.addEventListener('change', (state) => {
      if (cancelled) return;
      if (state === 'active') enable();
    });

    return () => {
      cancelled = true;
      disable();
      sub.remove();
    };
  }, [isAndroid]);
}
