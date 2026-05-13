import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type LanguageCode = 'uk' | 'en' | 'de' | 'ru';

export interface LocalizedPaths {
  services: string;
  about: string;
  contacts: string;
  blog: string;
  faq: string;
  privacy: string;
  terms: string;
  serviceSlugs: {
    divorce: string;
    property: string;
    alimony: string;
    children: string;
    inheritance: string;
    domestic_violence: string;
    property_rights: string;
    housing_disputes?: string;
  };
}

export const LOCALIZED_PATHS: Record<LanguageCode, LocalizedPaths> = {
  uk: {
    services: 'послуги',
    about: 'про-мене',
    contacts: 'контакти',
    blog: 'блог',
    faq: 'faq',
    privacy: 'політика-конфіденційності',
    terms: 'умови-використання',
    serviceSlugs: {
      divorce: 'розлучення',
      property: 'поділ-майна',
      alimony: 'аліменти',
      children: 'діти',
      inheritance: 'спадкування',
      domestic_violence: 'домашнє-насильство',
      property_rights: 'право-власності',
    }
  },
  en: {
    services: 'services',
    about: 'about',
    contacts: 'contacts',
    blog: 'blog',
    faq: 'faq',
    privacy: 'privacy-policy',
    terms: 'terms-of-use',
    serviceSlugs: {
      divorce: 'divorce',
      property: 'property-division',
      alimony: 'alimony',
      children: 'children',
      inheritance: 'inheritance',
      domestic_violence: 'domestic-violence',
      property_rights: 'property-rights',
    }
  },
  de: {
    services: 'leistungen',
    about: 'uber-mich',
    contacts: 'kontakte',
    blog: 'blog',
    faq: 'faq',
    privacy: 'datenschutz',
    terms: 'nutzungsbedingungen',
    serviceSlugs: {
      divorce: 'scheidung',
      property: 'guterteilung',
      alimony: 'unterhalt',
      children: 'kinder',
      inheritance: 'erbe',
      domestic_violence: 'hausliche-gewalt',
      property_rights: 'eigentumsrechte',
    }
  },
  ru: {
    services: 'услуги',
    about: 'обо-мне',
    contacts: 'контакты',
    blog: 'блог',
    faq: 'faq',
    privacy: 'политика-конфиденциальности',
    terms: 'условия-использования',
    serviceSlugs: {
      divorce: 'развод',
      property: 'раздел-имущества',
      alimony: 'алименты',
      children: 'дети',
      inheritance: 'наследование',
      domestic_violence: 'домашнее-насилие',
      property_rights: 'право-собственности',
    }
  }
};

export const transliterate = (text: string) => {
  const ukToEn: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
    'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'YE', 'Ж': 'ZH', 'З': 'Z',
    'И': 'Y', 'І': 'I', 'Ї': 'YI', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
    'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'KH', 'Ц': 'TS', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH',
    'Ю': 'YU', 'Я': 'YA'
  };

  return text
    .split('')
    .map(char => ukToEn[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Gets the absolute API URL if running on a different domain (like Cloudflare),
 * otherwise returns the relative path.
 */
export function getApiUrl(path: string): string {
  // Використовуємо публічну адресу (Shared App URL) для зовнішнього доступу
  // Це дозволяє уникнути редіректів на сторінку логіну AI Studio
  const meta = import.meta as any;
  const BACKEND_URL = meta.env?.VITE_API_URL || "https://ais-pre-skbchq2dvhfsfapj3tuv7p-823224117432.europe-west2.run.app";
  
  // Якщо ми працюємо на іншому домені (наприклад, Cloudflare), використовуємо абсолютний URL
  const isDifferentDomain = !window.location.host.includes("run.app") && 
                           !window.location.hostname.includes("localhost") &&
                           !window.location.hostname.includes("127.0.0.1");
  
  if (isDifferentDomain || meta.env?.VITE_API_URL) {
    const cleanBase = BACKEND_URL.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  
  return path;
}
