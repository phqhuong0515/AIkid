/**
 * Helpers unwrap response StoryMee Gateway / core-*.
 * Nhiều endpoint trả `{ status, data: T }` hoặc `{ status, user, token }`.
 */

export function unwrapData<T>(payload: unknown): T {
  if (payload != null && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if ('data' in obj && obj.data !== undefined) {
      return obj.data as T;
    }
  }
  return payload as T;
}

/** Lấy message lỗi từ body axios/fastify — ưu tiên copy end-user. */
export function extractErrorMessage(err: unknown, fallback: string): string {
  const ax = err as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string; statusCode?: number };
    };
    message?: string;
    code?: string;
  };

  if (ax.response?.status === 401) {
    const serverMsg = ax.response.data?.message || ax.response.data?.error;
    if (serverMsg && !/jwt|token|bearer/i.test(serverMsg)) {
      return serverMsg;
    }
    return 'Phiên đăng nhập hết hạn hoặc mật khẩu không đúng';
  }

  if (ax.response?.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này';
  }

  if (ax.response?.status === 409) {
    return (
      ax.response.data?.message ||
      ax.response.data?.error ||
      'Dữ liệu đã tồn tại'
    );
  }

  if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
    return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
  }

  if (ax.code === 'ECONNABORTED' || /timeout/i.test(ax.message || '')) {
    return 'Máy chủ phản hồi chậm. Thử lại sau.';
  }

  const raw =
    ax.response?.data?.message ??
    ax.response?.data?.error ??
    (err instanceof Error ? err.message : undefined);

  if (!raw) return fallback;
  if (/EXPO_PUBLIC|stack|ECONNREFUSED|at \//i.test(raw) || raw.length > 160) {
    return fallback;
  }
  return raw;
}
