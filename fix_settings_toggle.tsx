// Fix for Generate Opening Toggle
// Replace lines 411-420 in SettingsModal.tsx with this content

                    {/* Generate Opening Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.generate_opening')}</span>
                        <button
                           onClick={() => updateConfig(provider, undefined, undefined, undefined, undefined, undefined, !aiConfig.generateOpeningWithAI)}
                          className={`w-11 h-6 rounded-full transition-colors relative ${aiConfig.generateOpeningWithAI ? colorClasses.primary : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${aiConfig.generateOpeningWithAI ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
