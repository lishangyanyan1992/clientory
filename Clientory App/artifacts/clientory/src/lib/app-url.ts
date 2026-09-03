export const CLIENTORY_APP_URL = "https://app.clientory.org";

export const CLIENTORY_BETA_APPLICATION_PATH = "/signup?promo=Clientory-beta";
export const CLIENTORY_FREE_AUDIT_PATH = "/audit";

export function getClientoryAppUrl(destinationPath = "") {
  return new URL(destinationPath, `${CLIENTORY_APP_URL}/`).toString();
}
