import { useState, useEffect, useRef } from 'react';

/**
 * 节流Hook
 * @param value 需要节流的值
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的值
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * 节流回调Hook
 * @param callback 需要节流的回调函数
 * @param delay 延迟时间（毫秒）
 * @param deps 依赖数组
 * @returns 节流后的回调函数
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [throttledCallback, setThrottledCallback] = useState<T>(callback);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledCallback(() => callback);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledCallback(() => callback);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [callback, delay, ...deps]);

  return throttledCallback;
}
