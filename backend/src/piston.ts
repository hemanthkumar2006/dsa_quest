const PISTON_API_URL = process.env.PISTON_API_URL ?? "http://localhost:2000";

export interface PistonResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    output: string;
  };
}

export async function runOnPiston(
  language: string,
  version: string,
  sourceCode: string,
  stdin: string
): Promise<PistonResult> {
  const res = await fetch(`${PISTON_API_URL}/api/v2/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: sourceCode }],
      stdin,
    }),
  });

  if (!res.ok) {
    throw new Error(`Piston request failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<PistonResult>;
}
