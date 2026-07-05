import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/lib/i18n';

interface ProcessFrequentQuestionsProps {
  processType: string;
  onQuestionClick: (question: string) => void;
}

export function ProcessFrequentQuestions({ processType, onQuestionClick }: ProcessFrequentQuestionsProps) {
  const { language } = useLanguage();
  const t = useTranslations(language);

  const questions = {
    civil: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    penal: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    laboral: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    administrativo: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    familia: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    comercial: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    constitucional: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ],
    otros: [
      t.quickQuestion1,
      t.quickQuestion2,
      t.quickQuestion3,
      t.quickQuestion4
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
          <HelpCircle className="h-5 w-5" />
          {t.quickQuestions}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {questions[processType as keyof typeof questions]?.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => onQuestionClick(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}