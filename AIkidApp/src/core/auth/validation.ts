/** Validate form auth — message thân thiện end-user */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validateLoginInput(email: string, password: string): string | null {
  if (!email.trim() || !password) {
    return 'Vui lòng nhập email và mật khẩu';
  }
  if (!isValidEmail(email)) {
    return 'Email không hợp lệ';
  }
  return null;
}

export function validateRegisterInput(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  acceptedTerms?: boolean;
}): string | null {
  if (!input.name.trim() || !input.email.trim() || !input.password) {
    return 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu';
  }
  if (!isValidEmail(input.email)) {
    return 'Email không hợp lệ';
  }
  if (input.password.length < 8) {
    return 'Mật khẩu cần ít nhất 8 ký tự';
  }
  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    return 'Mật khẩu xác nhận không khớp';
  }
  if (input.acceptedTerms === false) {
    return 'Bạn cần đồng ý Điều khoản & Chính sách bảo mật';
  }
  return null;
}

export function friendlyAuthError(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  const m = raw.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('409')) {
    return 'Email này đã được đăng ký';
  }
  if (m.includes('invalid email or password') || m.includes('invalid credentials')) {
    return 'Email hoặc mật khẩu không đúng';
  }
  if (m.includes('password must be at least')) {
    return 'Mật khẩu quá ngắn';
  }
  if (m.includes('network') || m.includes('gateway') || m.includes('econn')) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
  }
  if (m.includes('unauthorized') || m.includes('jwt')) {
    return 'Email hoặc mật khẩu không đúng';
  }
  if (raw.length > 120) return fallback;
  return raw;
}
