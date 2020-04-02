import { request, instance as config } from 'gaxios';

config.defaults = {
  baseURL: "https://guest.api.arcadia.pinnacle.com/0.1",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "x-api-key": "CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R",
    "x-device-uuid": "995eb6f3-65211f6e-e22c04e9-42a211b8",
    referrer: "https: //www.pinnacle.com/en/soccer/leagues/",
    referrerPolicy: "no-referrer-when-downgrade"
  },
  timeout: 10000
};

export async function list<T>(url: string): Promise<T[]> {
  const resp = await request<T[]>({ url });
  return resp.data;
}
