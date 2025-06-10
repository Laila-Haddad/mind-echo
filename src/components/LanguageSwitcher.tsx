import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [])

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      className="fixed top-4 start-4 z-50 bg-muted hover:bg-primary border-border"
    >
    <Globe className="w-9 h-9 text-secondary" />
      {i18n.language === 'en' ? 'العربية' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;