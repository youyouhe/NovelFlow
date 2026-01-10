import React from 'react';
import { Icons } from '../constants';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const { t } = useI18n();
  const { colorClasses } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Icons.Book /> {t('help.title')}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <section>
            <h3 className={`text-lg font-semibold ${colorClasses.text} mb-2 flex items-center gap-2`}>
              <span className={`${colorClasses.bgSoft} p-1 rounded`}><Icons.Book /></span> 
              1. {t('help.section1.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-2">
              {t('help.section1.desc')}
            </p>
            <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 text-sm space-y-1 ml-2">
              <li>{t('help.section1.p1')}</li>
              <li>{t('help.section1.p2')}</li>
              <li>{t('help.section1.p3')}</li>
            </ul>
          </section>

          <section>
            <h3 className={`text-lg font-semibold ${colorClasses.text} mb-2 flex items-center gap-2`}>
              <span className={`${colorClasses.bgSoft} p-1 rounded`}><Icons.Pen /></span>
              2. {t('help.section2.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-2">
              {t('help.section2.desc')}
            </p>
            <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 text-sm space-y-1 ml-2">
              <li>{t('help.section2.p1')}</li>
              <li>{t('help.section2.p2')}</li>
            </ul>
          </section>

          <section>
            <h3 className={`text-lg font-semibold ${colorClasses.text} mb-2 flex items-center gap-2`}>
              <span className={`${colorClasses.bgSoft} p-1 rounded`}><Icons.Sparkles /></span>
              3. {t('help.section3.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-2">
              {t('help.section3.desc')}
            </p>
            <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 text-sm space-y-1 ml-2">
              <li>{t('help.section3.p1')}</li>
              <li>{t('help.section3.p2')}</li>
            </ul>
          </section>

          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
             <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">{t('help.privacy')}</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400">
               {t('help.privacy.desc')}
             </p>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className={`px-6 py-2 ${colorClasses.primary} ${colorClasses.hover} text-white rounded font-medium text-sm transition-colors`}
          >
            {t('help.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;