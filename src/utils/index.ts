export async function checkTextWithAI(text: string): Promise<{
  isAcceptable: boolean;
  suggestions: string | null;
}> {
  const response = await fetch("https://ai-as-api.lerry.me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const result = (await response.json()) as {
    assessment: "适当" | "不适当";
    suggestions: string | null;
  } | null;

  if (!result) {
    throw new Error("AI 检查失败");
  }

  return {
    isAcceptable: result.assessment === "适当",
    suggestions: "Please use appropriate language.",
  };
}

// 使用sessionStorage缓存函数结果, 使用装饰器实现, key 自动生成
export function cacheWithSessionStorageDecorator<
  T extends (...args: any[]) => Promise<any>,
>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    const key = `${fn.name}-${JSON.stringify(args)}`;
    const cachedValue = sessionStorage.getItem(key);

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    try {
      const value = await fn(...args);

      if (value !== null && value !== undefined) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }

      return value;
    } catch (error) {
      console.error("请求失败，不缓存结果:", error);
      throw error;
    }
  }) as T;
}
