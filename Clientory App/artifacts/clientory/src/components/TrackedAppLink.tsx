import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { CLIENTORY_APP_URL } from "@/lib/app-url";
import { buildTrackedAppUrl } from "@/lib/marketing-attribution";

type TrackedAppLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  placement: string;
  offer: "free_report" | "subscription_trial";
};

export function TrackedAppLink({
  placement,
  offer,
  onClick,
  children,
  ...props
}: TrackedAppLinkProps) {
  const posthog = usePostHog();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const { attribution, clickId, destination, landingPath } = buildTrackedAppUrl(
      placement,
      offer,
    );

    // Set the final URL synchronously so normal anchor behavior—including open
    // in new tab—carries the attribution data into the product application.
    event.currentTarget.href = destination;
    posthog.capture("marketing_cta_clicked", {
      placement,
      offer,
      click_id: clickId,
      destination,
      landing_path: landingPath,
      source_page: window.location.pathname,
      source_url: window.location.href,
      ...attribution,
    }, {
      transport: "sendBeacon",
    });
    onClick?.(event);
  };

  return (
    <a
      href={CLIENTORY_APP_URL}
      data-cta-placement={placement}
      data-cta-offer={offer}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
