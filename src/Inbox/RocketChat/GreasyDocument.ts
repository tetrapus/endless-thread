export interface GreasyDocument extends Document {
  rocketchatServer?: string;
  rocketchatCorsBypass?: (options: {
    method: string;
    url: string;
    headers?: { [header: string]: string };
    data?: string;
    onload: (r: Response & { finalUrl: string }) => void;
  }) => void;
  rocket?: (method: string, endpoint: string, data?: any) => Promise<any>;
}
