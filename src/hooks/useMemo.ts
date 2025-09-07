import { useMemo, useRef, useCallback } from 'react';

/**
 * 深度比较的useMemo
 * @param factory 工厂函数
 * @param deps 依赖数组
 * @returns 记忆化的值
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  return useMemo(() => {
    if (!ref.current || !deepEqual(deps, ref.current.deps)) {
      ref.current = { deps, value: factory() };
    }
    return ref.current.value;
  }, deps);
}

/**
 * 深度比较两个值是否相等
 * @param a 第一个值
 * @param b 第二个值
 * @returns 是否相等
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * 稳定的回调Hook
 * @param callback 回调函数
 * @param deps 依赖数组
 * @returns 稳定的回调函数
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T {
  const ref = useRef<T>(callback);
  const depsRef = useRef<React.DependencyList>(deps);

  if (!deepEqual(deps, depsRef.current)) {
    ref.current = callback;
    depsRef.current = deps;
  }

  return useCallback(ref.current, deps);
}
