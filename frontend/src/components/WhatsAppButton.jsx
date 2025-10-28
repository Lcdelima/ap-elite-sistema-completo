import React, { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contacts = [
    {
      name: 'Perícia Digital',
      phone: '5511916468611',
      displayPhone: '(11) 9 1646-8611',
      message: 'Olá! Gostaria de solicitar informações sobre perícia digital.',
      icon: '🔍'
    },
    {
      name: 'Advocacia Criminal',
      phone: '5511972190768',
      displayPhone: '(11) 9 7219-0768', 
      message: 'Olá! Preciso de consultoria em advocacia criminal.',
      icon: '⚖️'
    }
  ];

  const handleWhatsAppClick = (contact) => {
    const encodedMessage = encodeURIComponent(contact.message);
    const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsExpanded(false);
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isExpanded && (
          <div className="mb-4 space-y-2">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-[280px] animate-in slide-in-from-right"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{contact.icon}</span>
                    <span className="font-semibold text-gray-800">{contact.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-3 w-3 mr-1" />
                    {contact.displayPhone}
                  </div>
                </div>
                <Button
                  onClick={() => handleWhatsAppClick(contact)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-2"
                  data-testid={`whatsapp-contact-${index}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Conversar no WhatsApp</span>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
            isExpanded 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
          data-testid="whatsapp-main-button"
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>
    </>
  );
};

export default WhatsAppButton;