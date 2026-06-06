/**
 * Helper utilities for tracking pageviews and user events with GA4.
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Track pageviews
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag && GA_TRACKING_ID) {
    (window as any).gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track specific events (e.g. tool usage, copying results)
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && (window as any).gtag && GA_TRACKING_ID) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};
