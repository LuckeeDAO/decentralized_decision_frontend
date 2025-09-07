/**
 * 性能监控工具
 */

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Set<(metrics: PerformanceMetrics[]) => void> = new Set();

  /**
   * 开始性能监控
   * @param name 监控名称
   * @returns 监控ID
   */
  start(name: string): string {
    const id = `${name}_${Date.now()}_${Math.random()}`;
    this.metrics.set(id, {
      name,
      startTime: performance.now(),
    });
    return id;
  }

  /**
   * 结束性能监控
   * @param id 监控ID
   * @returns 持续时间（毫秒）
   */
  end(id: string): number | null {
    const metric = this.metrics.get(id);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    this.notifyObservers();
    return duration;
  }

  /**
   * 获取性能指标
   * @param name 监控名称
   * @returns 性能指标数组
   */
  getMetrics(name?: string): PerformanceMetrics[] {
    const metrics = Array.from(this.metrics.values());
    return name ? metrics.filter(m => m.name === name) : metrics;
  }

  /**
   * 清除性能指标
   * @param name 监控名称
   */
  clear(name?: string): void {
    if (name) {
      for (const [id, metric] of this.metrics.entries()) {
        if (metric.name === name) {
          this.metrics.delete(id);
        }
      }
    } else {
      this.metrics.clear();
    }
  }

  /**
   * 添加观察者
   * @param observer 观察者函数
   */
  addObserver(observer: (metrics: PerformanceMetrics[]) => void): void {
    this.observers.add(observer);
  }

  /**
   * 移除观察者
   * @param observer 观察者函数
   */
  removeObserver(observer: (metrics: PerformanceMetrics[]) => void): void {
    this.observers.delete(observer);
  }

  /**
   * 通知观察者
   */
  private notifyObservers(): void {
    const metrics = this.getMetrics();
    this.observers.forEach(observer => observer(metrics));
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能装饰器
 * @param name 监控名称
 * @returns 装饰器函数
 */
export function performanceDecorator(name: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const id = performanceMonitor.start(`${name}.${propertyName}`);
      try {
        const result = method.apply(this, args);
        
        // 处理异步方法
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            performanceMonitor.end(id);
          });
        }
        
        performanceMonitor.end(id);
        return result;
      } catch (error) {
        performanceMonitor.end(id);
        throw error;
      }
    };
  };
}

/**
 * 性能Hook
 * @param name 监控名称
 * @returns 性能监控函数
 */
export function usePerformance(name: string) {
  const start = () => performanceMonitor.start(name);
  const end = (id: string) => performanceMonitor.end(id);
  const getMetrics = () => performanceMonitor.getMetrics(name);
  const clear = () => performanceMonitor.clear(name);

  return { start, end, getMetrics, clear };
}

/**
 * 内存使用监控
 * @returns 内存使用信息
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return null;
}

/**
 * 页面加载性能监控
 * @returns 页面加载性能信息
 */
export function getPageLoadMetrics(): {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
} | null {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  if (!navigation) return null;

  const firstPaint = paint.find(entry => entry.name === 'first-paint');
  const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint');

  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: firstPaint ? firstPaint.startTime : 0,
    firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
  };
}

/**
 * 资源加载性能监控
 * @returns 资源加载性能信息
 */
export function getResourceMetrics(): {
  totalResources: number;
  totalSize: number;
  averageLoadTime: number;
  slowestResource: PerformanceEntry | null;
} {
  const resources = performance.getEntriesByType('resource');
  
  if (resources.length === 0) {
    return {
      totalResources: 0,
      totalSize: 0,
      averageLoadTime: 0,
      slowestResource: null,
    };
  }

  const totalSize = resources.reduce((sum, resource) => {
    return sum + (resource.transferSize || 0);
  }, 0);

  const totalLoadTime = resources.reduce((sum, resource) => {
    return sum + (resource.responseEnd - resource.startTime);
  }, 0);

  const slowestResource = resources.reduce((slowest, resource) => {
    const loadTime = resource.responseEnd - resource.startTime;
    const slowestLoadTime = slowest ? slowest.responseEnd - slowest.startTime : 0;
    return loadTime > slowestLoadTime ? resource : slowest;
  }, null as PerformanceEntry | null);

  return {
    totalResources: resources.length,
    totalSize,
    averageLoadTime: totalLoadTime / resources.length,
    slowestResource,
  };
}
