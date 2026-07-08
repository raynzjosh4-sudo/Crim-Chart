import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { AuthChoiceModalWidget } from '@/signing/components/AuthChoiceModalWidget';
import { LoginModalWidget } from '@/signing/components/LoginModalWidget';
import { SignupModalWidget } from '@/signing/components/SignupModalWidget';
import { useState } from 'react';

interface RequireAuthWrapperProps {
  children: (props: { checkAuth: (action: () => void, e?: any) => boolean }) => React.ReactNode;
}

export const RequireAuthWrapper: React.FC<RequireAuthWrapperProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [isChoiceModalVisible, setChoiceModalVisible] = useState(false);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = useState(false);

  const checkAuth = (action: () => void, e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!user) {
      setChoiceModalVisible(true);
      return false;
    } else {
      action();
      return true;
    }
  };

  return (
    <>
      {children({ checkAuth })}
      <AuthChoiceModalWidget
        visible={isChoiceModalVisible}
        onClose={() => setChoiceModalVisible(false)}
        onLoginClick={() => {
          setChoiceModalVisible(false);
          setLoginModalVisible(true);
        }} 
        onSignupClick={() => {
          setChoiceModalVisible(false);
          setSignupModalVisible(true);
        }} 
      />
      <LoginModalWidget visible={isLoginModalVisible} onClose={() => setLoginModalVisible(false)} />
      <SignupModalWidget 
        visible={isSignupModalVisible} 
        onClose={() => setSignupModalVisible(false)} 
        onGoToLogin={() => {
          setSignupModalVisible(false);
          setLoginModalVisible(true);
        }}
      />
    </>
  );
};
