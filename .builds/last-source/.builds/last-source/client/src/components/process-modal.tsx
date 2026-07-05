import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import type { ProcessDefinition } from '@/types';
import { PROCESS_DEFINITIONS } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  processType: string | null;
}

export function ProcessModal({ isOpen, onClose, processType }: ProcessModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  if (!processType || !PROCESS_DEFINITIONS[processType]) {
    return null;
  }

  const process = PROCESS_DEFINITIONS[processType];
  const progress = ((currentStep + 1) / process.totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < process.totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      alert(t.processSuccess);
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  const currentStepData = process.steps[currentStep] || {
    title: `${t.step} ${currentStep + 1}`,
    content: `<p>${t.processLoading}</p>`,
    completed: false
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{process.title}</span>
            <Badge variant={progress === 100 ? 'default' : 'secondary'}>
              {progress === 100 ? t.processStatus.completed : t.processStatus.inProgress}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>{t.currentStep}: {currentStep + 1}</span>
            <span>{t.totalSteps}: {process.totalSteps}</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: currentStepData.content }}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t.previous}
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentStepData.completed === false}
            >
              {currentStep === process.totalSteps - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.processStatus.completed}
                </>
              ) : (
                <>
                  {t.next}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
