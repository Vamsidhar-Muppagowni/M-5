import React, { useState } from 'react';
import Button from './Button';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Wizard = ({ steps, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { t } = useLanguage();

    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Progress Stepper */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex items-center justify-between min-w-max px-2">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${index <= currentStep
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-gray-300 text-gray-400'
                                }`}>
                                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${index <= currentStep ? 'text-emerald-800' : 'text-gray-400'
                                }`}>
                                {step.title}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-1 mx-4 rounded-full ${index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] mb-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-6">{steps[currentStep].title}</h3>
                <CurrentStepComponent />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isFirstStep}
                    className={isFirstStep ? 'invisible' : ''}
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {t('back') || 'Back'}
                </Button>

                <Button
                    variant="primary"
                    onClick={handleNext}
                    size="lg"
                    className="flex items-center gap-2"
                >
                    {isLastStep ? (t('finish') || 'Finish') : (t('next') || 'Next')}
                    {!isLastStep && <ChevronRight className="w-5 h-5" />}
                </Button>
            </div>
        </div>
    );
};

export default Wizard;
