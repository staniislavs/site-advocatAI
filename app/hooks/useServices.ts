import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALIZED_PATHS, LanguageCode } from '../lib/utils';

export function useServices() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] as LanguageCode) || 'uk';
  const paths = LOCALIZED_PATHS[currentLang];

  const services = useMemo(() => [
    { id: 'divorce', iconKey: 'divorce', featured: true },
    { id: 'property', iconKey: 'property' },
    { id: 'alimony', iconKey: 'alimony' },
    { id: 'children', iconKey: 'children' },
    { id: 'inheritance', iconKey: 'inheritance' },
    { id: 'domestic_violence', iconKey: 'domestic_violence' },
    { id: 'property_rights', iconKey: 'property_rights' }
  ].map((s) => ({
    ...s,
    name: t(`services.items.${s.id}.name`),
    desc: t(`services.items.${s.id}.desc`),
    details: t(`services.items.${s.id}.details`, { returnObjects: true }) as string[],
    slug: (paths.serviceSlugs as any)[s.id]
  })), [t, paths]);

  return { services, currentLang, paths };
}
