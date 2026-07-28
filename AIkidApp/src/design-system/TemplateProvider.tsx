import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { resolveTemplate } from './registry';
import type { AikidTemplate } from './types';

const TemplateContext = createContext<AikidTemplate | null>(null);

type TemplateProviderProps = {
  children: ReactNode;
  template?: AikidTemplate;
  templateId?: string;
};

export function TemplateProvider({
  children,
  template,
  templateId = process.env.EXPO_PUBLIC_UI_TEMPLATE,
}: TemplateProviderProps) {
  const value = useMemo(
    () => template ?? resolveTemplate(templateId),
    [template, templateId],
  );

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useAikidTemplate(): AikidTemplate {
  const template = useContext(TemplateContext);
  if (!template) {
    throw new Error('useAikidTemplate must be used inside TemplateProvider');
  }
  return template;
}
