const API_URL = process.env.EXPO_PUBLIC_API_URL;

if(!API_URL){
    throw new Error('A variável de ambiente EXPO_PUBLIC_API_URL não está definida.');
}

const TEMPO_LIMITE_MS = 10000;

interface ProblemDetail {
    status?: number;
    detail?: string;
    erros?: Record<string, string>;
}

export class ApiError extends Error {
    status: number;
    erros: Record<string, string>;

  constructor(status: number, message: string, erros: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.erros = erros;
  }

  get podeTentarNovamente(): boolean {
        return this.status === 0 || this.status >= 500;
  }
}

export async function requisicaoApi<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEMPO_LIMITE_MS);

    let response: Response;
    try {
        response = await fetch(`${API_URL}${caminho}`, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: corpo === undefined ? undefined : JSON.stringify(corpo),
            signal: controller.signal
        });
    } catch {
        throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
    } finally {
        clearTimeout(timeoutId);
    }

    if(response.status === 204){
        return undefined as T;
    }

    if(!response.ok){
        let problemDetail: ProblemDetail = {};
        try {
            problemDetail = await response.json();
        } catch {

        }
        throw new ApiError(response.status, problemDetail.detail ?? `Erro ${response.status} no servidor.`, problemDetail.erros ?? {});
    };
    return (await response.json()) as T;
}



