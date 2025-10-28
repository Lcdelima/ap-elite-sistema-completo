import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TourContext = createContext();

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

const tourSteps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao AP ELITE ATHENA! 🎉',
    description: 'Este é o sistema ERP mais completo para escritórios de advocacia. Vamos fazer um tour rápido!',
    target: null,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Unificado',
    description: 'Aqui você tem uma visão geral de todo o sistema: usuários, processos, finanças e muito mais.',
    target: '.dashboard-card',
    position: 'bottom'
  },
  {
    id: 'modules',
    title: 'Módulos do Sistema',
    description: 'Acesse todos os 24 módulos: gestão de processos, clientes, pericia digital, IA e muito mais.',
    target: '.module-grid',
    position: 'top'
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Receba alertas em tempo real sobre eventos importantes do sistema.',
    target: '.notification-bell',
    position: 'bottom'
  },
  {
    id: 'theme',
    title: 'Modo Escuro',
    description: 'Alterne entre modo claro e escuro para melhor conforto visual.',
    target: '.theme-toggle',
    position: 'bottom'
  },
  {
    id: 'finish',
    title: 'Pronto! 🚀',
    description: 'Você está pronto para usar o sistema. Explore os módulos e aproveite!',
    target: null,
    position: 'center'
  }
];

export const TourProvider = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    return localStorage.getItem('tour_completed') === 'true';
  });

  useEffect(() => {
    // Auto-start tour for new users
    if (!hasCompletedTour && !isTourActive) {
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, isTourActive]);

  const startTour = () => {
    setCurrentStep(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem('tour_completed', 'true');
  };

  const resetTour = () => {
    localStorage.removeItem('tour_completed');
    setHasCompletedTour(false);
  };

  const step = tourSteps[currentStep];

  return (
    <TourContext.Provider value={{ 
      isTourActive, 
      currentStep, 
      totalSteps: tourSteps.length,
      step,
      startTour, 
      nextStep, 
      prevStep, 
      skipTour,
      resetTour,
      hasCompletedTour
    }}>
      {children}
      
      {isTourActive && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" onClick={skipTour} />
          
          {/* Tour Card */}
          <div className={`fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md ${
            step.position === 'center' 
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : 'top-20 right-8'
          }`}>
            <button
              onClick={skipTour}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white pr-8">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {step.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {tourSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentStep 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                  {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={skipTour}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Pular tour
              </button>
            </div>
          </div>
        </>
      )}
    </TourContext.Provider>
  );
};