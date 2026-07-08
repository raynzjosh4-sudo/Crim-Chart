import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';

// Import all steps
import BioPage from './signup-steps/bio';
import BirthdayPage from './signup-steps/birthday';
import ChannelIntroPage from './signup-steps/channel-intro';
import ChannelSuggestionsPage from './signup-steps/channel-suggestions';
import CountrySelector from './signup-steps/country';
import CrownTitlePage from './signup-steps/crown-title';
import MobileNumberPage from './signup-steps/email';
import MusicCategoryPage from './signup-steps/music-category';
import OtpPage from './signup-steps/otp';
import PasswordPage from './signup-steps/password';
import ProfilePicturePage from './signup-steps/profile-picture';
import UserSuggestionsPage from './signup-steps/user-suggestions';
import UsernamePage from './signup-steps/username';



interface SignupModalWidgetProps {
  visible: boolean;
  onClose: () => void;
  onGoToLogin: () => void;
  initialStep?: string;
}

export const SignupModalWidget = ({ visible, onClose, onGoToLogin, initialStep = 'country' }: SignupModalWidgetProps) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [history, setHistory] = useState<string[]>([]);

  // Reset state when visible becomes true
  React.useEffect(() => {
    if (visible) {
      setCurrentStep(initialStep);
      setHistory([]);
    }
  }, [visible, initialStep]);

  const handleNext = (step: string) => {
    if (step === 'login') {
      onClose();
      onGoToLogin();
      return;
    }
    setHistory([...history, currentStep]);
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (history.length === 0) {
      onClose();
      return;
    }
    const newHistory = [...history];
    const prev = newHistory.pop();
    setHistory(newHistory);
    setCurrentStep(prev || initialStep);
  };

  const handleClose = () => {
    onClose();
  };

  const renderStep = () => {
    const props = { onNext: handleNext, onBack: handleBack, onClose: handleClose };
    switch (currentStep) {
      case 'country': return <CountrySelector {...props} />;
      case 'birthday': return <BirthdayPage {...props} />;
      case 'username': return <UsernamePage {...props} />;
      case 'email': return <MobileNumberPage {...props} />;
      case 'password': return <PasswordPage {...props} />;
      case 'otp': return <OtpPage {...props} />;
      case 'profile-picture': return <ProfilePicturePage {...props} />;
      case 'bio': return <BioPage {...props} />;
      case 'music-category': return <MusicCategoryPage {...props} />;
      case 'crown-title': return <CrownTitlePage {...props} />;
      case 'user-suggestions': return <UserSuggestionsPage {...props} />;
      case 'channel-intro': return <ChannelIntroPage {...props} />;
      case 'channel-suggestions': return <ChannelSuggestionsPage {...props} />;
      default: return <CountrySelector {...props} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isMobile ? "slide" : "fade"}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={[styles.overlay, isMobile && { justifyContent: 'flex-end' }]}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.contentContainer,
              isMobile ? styles.mobileSheet : styles.desktopModal
            ]}>
              {renderStep()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    flex: 1,
  },
  desktopModal: {
    maxWidth: 600,
    height: '80%',
    maxHeight: 700,
    borderRadius: 16,
    overflow: 'hidden',
    flex: undefined,
    backgroundColor: '#000000', // Matches colors.background
  },
  mobileSheet: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    flex: undefined,
    backgroundColor: '#000000', // Matches colors.background
  }
});
