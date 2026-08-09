import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { CLIENTORY_APP_URL } from "@/lib/app-url";

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
    posthog.capture("marketing_cta_clicked", {
      placement,
      offer,
      destination: CLIENTORY_APP_URL,
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
