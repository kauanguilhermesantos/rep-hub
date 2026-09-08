// Erros de validação do backend vêm como { "campo": "mensagem", ... }.
// Outros erros (401, 409, etc.) vêm como texto puro no corpo da resposta.
export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  fieldErrors?: FieldErrors

  constructor(message: string, fieldErrors?: FieldErrors) {
    super(message)
    this.name = "ApiError"
    this.fieldErrors = fieldErrors
  }
}

// Lê o corpo da resposta de erro uma única vez (como texto) e tenta
// interpretar como JSON de validação; se não for, usa o texto puro.
export async function lancarErroApi(response: Response, mensagemPadrao: string): Promise<never> {
  let corpo = ""
  try {
    corpo = await response.text()
  } catch {
    throw new ApiError(mensagemPadrao)
  }

  if (!corpo) {
    throw new ApiError(mensagemPadrao)
  }

  try {
    const dados = JSON.parse(corpo)
    if (dados && typeof dados === "object" && !Array.isArray(dados)) {
      const valores = Object.values(dados)
      if (valores.length > 0 && valores.every((v) => typeof v === "string")) {
        throw new ApiError(valores[0] as string, dados as FieldErrors)
      }
    }
  } catch (err) {
    if (err instanceof ApiError) throw err
    // não era JSON — cai para o texto puro abaixo
  }

  throw new ApiError(corpo)
}

// Busca a mensagem de um campo específico num erro, se for um ApiError com fieldErrors
export function erroDoCampo(err: unknown, campo: string): string | undefined {
  if (err instanceof ApiError) {
    return err.fieldErrors?.[campo]
  }
  return undefined
}