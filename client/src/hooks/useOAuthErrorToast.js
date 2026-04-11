import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';

const OAUTH_ERROR_MESSAGES = {
  oauth_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
  authentication_failed: 'Đăng nhập Google thất bại. Vui lòng thử lại.',
  user_inactive: 'Không tìm thấy người dùng hoặc tài khoản đã bị vô hiệu hóa.',
  no_email_provided:
    'Google không cung cấp email. Vui lòng dùng tài khoản khác.'
};

const useOAuthErrorToast = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasShownOAuthError = useRef(false);

  useEffect(() => {
    const errorCode = searchParams.get('error');

    if (!errorCode || hasShownOAuthError.current) {
      return;
    }

    const message =
      OAUTH_ERROR_MESSAGES[errorCode] ||
      'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';

    toast.error(message);
    hasShownOAuthError.current = true;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('error');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);
};

export default useOAuthErrorToast;
