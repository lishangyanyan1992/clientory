import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { getClientoryAppUrl } from "@/lib/app-url";
import { buildTrackedAppUrl } from "@/lib/marketing-attribution";

type TrackedAppLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  ctaName?: string;
  destinationPath?: string;
  placement: string;
  offer: "free_report" | "subscription_trial" | "beta_application" | "free_ai_audit";
};

export function TrackedAppLink({
  ctaName,
  destinationPath = "",
  placement,
  offer,
  onClick,
  children,
  ...props
}: TrackedAppLinkProps) {
  const posthog = usePostHog();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const {
      accountScope,
      attribution,
      clickId,
      destination,
      destinationPath: trackedDestinationPath,
      funnelVersion,
      landingPath,
    } = buildTrackedAppUrl(placement, offer, destinationPath);

    // Set the final URL synchronously so normal anchor behavior—including open
    // in new tab—carries the attribution data into the product application.
    event.currentTarget.href = destination;
    posthog.capture("marketing_cta_clicked", {
      cta_name: ctaName ?? offer,
      placement,
      offer,
      account_scope: accountScope,
      click_id: clickId,
      destination,
      destination_path: trackedDestinationPath,
      funnel_version: funnelVersion,
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
      href={getClientoryAppUrl(destinationPath)}
      data-cta-name={ctaName ?? offer}
      data-cta-placement={placement}
      data-cta-offer={offer}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
