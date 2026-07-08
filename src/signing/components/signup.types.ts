export interface StepProps {
  onNext: (step: string) => void;
  onBack: () => void;
  onClose?: () => void;
  onFinish?: () => void;
}
